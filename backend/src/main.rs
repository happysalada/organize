use juniper::{
    graphql_object, http::graphiql, http::GraphQLRequest, EmptySubscription, FieldResult, RootNode,
};
use lazy_static::lazy_static;
use sqlx::sqlite::SqlitePool;
use trillium::{conn_try, Conn, Init, State};
use trillium_logger::Logger;
use trillium_router::Router;
use ulid::Ulid;

#[derive(Clone, juniper::GraphQLObject)]
#[graphql(description = "A plan")]
struct Plan {
    id: String,
    title: String,
    description: Option<String>,
}

#[derive(juniper::GraphQLInputObject)]
struct NewPlan {
    title: String,
    description: Option<String>,
}

impl NewPlan {
    fn into_internal(self) -> Plan {
        Plan {
            id: Ulid::new().to_string(),
            title: self.title,
            description: self.description,
        }
    }
}

pub struct QueryRoot;

#[graphql_object(Context=Context)]
impl QueryRoot {
    #[graphql(description = "Get all Plans")]
    async fn plans(context: &Context) -> FieldResult<Vec<Plan>> {
        let plans = sqlx::query_as!(Plan, "SELECT * FROM plans")
            .fetch_all(&context.pool)
            .await?;
        Ok(plans.iter().cloned().collect())
    }
}

pub struct MutationRoot;

#[graphql_object(Context=Context)]
impl MutationRoot {
    #[graphql(description = "Add new plan")]
    async fn create_plan(context: &Context, plan: NewPlan) -> FieldResult<Plan> {
        let ulid = Ulid::new().to_string();
        sqlx::query!(
            "INSERT INTO PLANS (id, title) VALUES (?, ?)",
            ulid,
            plan.title
        )
        .execute(&context.pool)
        .await?;
        Ok(plan.into_internal())
    }
}

pub type Schema = RootNode<'static, QueryRoot, MutationRoot, EmptySubscription<Context>>;
lazy_static! {
    static ref SCHEMA: Schema =
        Schema::new(QueryRoot {}, MutationRoot {}, EmptySubscription::new());
}

pub struct Context {
    pool: SqlitePool,
}

impl juniper::Context for Context {}

async fn handle_graphiql(conn: Conn) -> Conn {
    conn.with_header(("content-type", "text/html"))
        .ok(graphiql::graphiql_source("/graphql", None))
}

async fn handle_graphql(mut conn: Conn) -> Conn {
    let raw_body = conn_try!(conn, conn.request_body_string().await);
    let query: GraphQLRequest = conn_try!(conn, serde_json::from_str(&raw_body));
    let context = Context {
        pool: conn.state::<SqlitePool>().unwrap().to_owned(),
    };
    let response = query.execute(&SCHEMA, &context).await;
    let json = conn_try!(conn, serde_json::to_string(&response));
    conn.ok(json)
}

async fn not_found(conn: Conn) -> Conn {
    let body = format!("Uh oh, I don't have a route for {}", conn.path());
    conn.with_body(body).with_status(404)
}

fn main() {
    env_logger::init();
    trillium_tokio::config()
        .with_port(8080)
        .with_host("localhost")
        .with_nodelay()
        .run((
            Logger::new(),
            Init::new(|_| async move {
                let db = SqlitePool::connect(&std::env::var("DATABASE_URL").unwrap())
                    .await
                    .unwrap();
                State::new(db)
            }),
            Router::new()
                .get("/graphiql", handle_graphiql)
                .post("/graphql", handle_graphql),
            not_found,
        ));
}
