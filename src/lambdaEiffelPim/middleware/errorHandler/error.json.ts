const retryStr = "retry";
const errorStr = "error";
export default {
    internal_error: {
        "status": 500,
        "code": "internal_error",
        "message": "Internal Error",
        "name": retryStr
    },
    error_not_found: {
        "status": 500,
        "code": "error_not_found",
        "message": "attr error not found",
        "name": retryStr
    },
    unauthorized: {
        "status": 401,
        "code": "unauthorized",
        "message": "Unauthorized",
        "name": errorStr
    },
    secret_manager_not_found : {
        "status": 500,
        "code": "secret_manager_not_found",
        "message": "Secret manager not found",
        "name": errorStr
    },
    error_in_db_provider: {
        "status": 500,
        "code": "error_in_db_provider",
        "message": "Inconvenience to access db provider",
        "name": retryStr
    },
    error_in_db_connection : {
        "status": 500,
        "code": "error_in_db_connection",
        "message": "Error in db connection",
        "name": retryStr
    },
    error_in_db_disconnected : {
        "status": 500,
        "code": "error_in_db_disconnected",
        "message": "db was disconnected before",
        "name": retryStr
    },
    error_db_save : {
        "status": 500,
        "code": "error_db_save",
        "message": "Error db save",
        "name": retryStr
    },
    secret_manager_error : {
        "status": 500,
        "code": "secret_manager_error",
        "message": "",
        "name": retryStr
    },
    db_get_data_by_query_query: {
        "status": 500,
        "code": "db_get_data_by_query_query",
        "message": "[Error in query dynamodb repository]: bad request or connection error",
        "name": retryStr
    },
    pim_conection_error: {
        "status": 500,
        "code": "pim_conection_error",
        "message": "[Error in get pim ]: bad request or connection error",
        "name": retryStr
    },
    bulk_insert_error: {
        "status": 500,
        "code": "bulk_insert_error",
        "message": "[Error in batchWrite dynamodb repository]: bad request or connection error",
        "name": retryStr
    },
    dbConnection_not_found: {
        "status": 500,
        "code": "dbConnection_not_found",
        "message": "Data base connection not found",
        "name": retryStr
    },
    warehouses_not_found: {
        "status": 409,
        "code": "warehouses_not_found",
        "message": "Warehouses not found",
        "name": retryStr
    },
    empty_sku_list: {
        "status": 409,
        "code": "empty_sku_list",
        "message": "Empty sku list",
        "name": retryStr
    },
    empty_updated_items: {
        "status": 409,
        "code": "empty_updated_items",
        "message": "empty updated items",
        "name": errorStr
    },
    dynamodb_update_error: {
        "status": 500,
        "code": "dynamodb_update_error",
        "message": "[Db Error]: DynamoDB update failed",
        "name": retryStr
    }
}