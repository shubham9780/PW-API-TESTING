import { request } from "playwright";
import { RequestHandler } from "../utils/request-handler";
import { config } from "../api-test.config";
import { APILogger } from "../utils/logger";

/**
 * Create an authentication token using the shared config credentials.
 * This helper logs in with email and password then returns the user token.
 */
export async function createToken(email:string, password:string) {

    const context= await request.newContext();
    const logger= new APILogger();
    const api=new RequestHandler(context,config.apiUrl, logger);

    try{
         const tokenResponse= await api  .path('/users/login')
         .body({
                "user":{
                         "email": email,
                         "password": password
                       }
            })
          .postRequest(200);
          return tokenResponse.user.token;
    }
    catch(error){
      // Capture the stack trace at this helper to make failures easier to debug.
      Error.captureStackTrace(error as Error,createToken);
      throw error;
    }
    finally{
        // Always dispose the Playwright request context once the helper is done.
        await context.dispose();
    }
}
