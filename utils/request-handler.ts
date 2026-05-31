// Helper class that provides a fluent interface for building and executing API requests.
// It uses Playwright's APIRequestContext to send HTTP requests and a logger to store request/response details.
import { APIRequestContext } from "@playwright/test";
import{test} from "@playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {

   private request: APIRequestContext;
   private baseUrl: string | undefined
   private logger: APILogger;
   private defaultBaseUrl: string = ''
   private apiPath: string='';
   private queryParams: object={} 
   private apiHeaders: Record<string,string>={}
   private apiBody: object={}
   private defaultAuthToken:string
   private clearAuthFlag: boolean


   // Initialize RequestHandler with the Playwright request context, base API URL, and logger.
   constructor(requst:APIRequestContext,apiBaseUrl:string,logger: APILogger,authToken:string = ''){
     this.request=requst;
     this.defaultBaseUrl=apiBaseUrl;
     this.logger=logger;
      this.defaultAuthToken=authToken;
      this.clearAuthFlag=false;
   }

   // Set the endpoint base URL for this request.
   url(url: string){
        this.baseUrl = url;
        return this
   }

   // Set the API path that will be appended to the base URL.
   path(path:string){
        this.apiPath = path;
        return this
   }

   // Set query parameters for the request URL.
   params(params: object){
        this.queryParams = params;
        return this
   }

   // Set request headers for the current API call.
   headers(headers: Record<string,string>){
        this.apiHeaders = headers;
        return this
   }

   // Set the JSON body payload for POST or PUT requests.
   body(body: object){
        this.apiBody = body;
        return this
   }

   clearAuth(){
    this.clearAuthFlag=true;
    return this;
   }

   // Execute a GET request and validate the expected status code.
   async getRequest(statusCode:number)
   {
     let responseJSON:any;

     const url=this.getUrl();
     await test.step(`GET request to: ${url}`, async () => {
            this.logger.logRequest('GET',url,this.getHeades());
            const response= await this.request.get(url,{
            headers:this.getHeades()
            })
            this.cleanUpFields();
            const actualStatus=response.status();
            responseJSON= await response.json();
            this.logger.logResponse(actualStatus,responseJSON);
            this.statusCodeValidator(actualStatus,statusCode,this.getRequest);
     });
     return responseJSON;
   }

   // Execute a POST request and validate the returned status code.
   async postRequest(statusCode:number)
   {

     let responseJSON:any;
     const url=this.getUrl();
     await test.step(`POST request to: ${url}`, async () => {
           this.logger.logRequest('POST',url,this.getHeades(),this.apiBody);
           const response= await this.request.post(url,{
           headers:this.getHeades(),
           data:this.apiBody
           })
           this.cleanUpFields();
           const actualStatus=response.status();
           responseJSON= await response.json();
           this.logger.logResponse(actualStatus,responseJSON);
           this.statusCodeValidator(actualStatus,statusCode,this.postRequest);
     });
     
     return responseJSON;
   }

   // Execute a PUT request and validate the returned status code.
    async putRequest(statusCode:number)
   {
     let responseJSON:any;
     const url=this.getUrl();
     await test.step(`PUT request to: ${url}`, async () => {
           this.logger.logRequest('PUT',url,this.getHeades(),this.apiBody);
           const response= await this.request.put(url,{
           headers:this.getHeades(),
           data:this.apiBody
           })
           this.cleanUpFields();
           const actualStatus=response.status();
           responseJSON= await response.json();
           this.logger.logResponse(actualStatus,responseJSON);
           this.statusCodeValidator(actualStatus,statusCode,this.putRequest);
     });
     
     return responseJSON;
   }

   // Execute a DELETE request and validate the returned status code.
    async deleteRequest(statusCode:number)
   {
     const url=this.getUrl();
     await test.step(`DELETE request to: ${url}`, async () => {
            this.logger.logRequest('DELETE',url,this.getHeades());
            const response= await this.request.delete(url,{
            headers:this.getHeades()
            })
            this.cleanUpFields();
            const actualStatus=response.status();
            this.logger.logResponse(actualStatus);
            this.statusCodeValidator(actualStatus,statusCode,this.deleteRequest);
     });

   }

   // Construct the final request URL from base URL, path, and query parameters.
   private getUrl(){
     const url=new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`);
     for(const [key,value] of Object.entries(this.queryParams)){
            url.searchParams.append(key,value.toString());
     }
     return url.toString();
   }

   // Verify that the actual status code matches the expected status code.
   // If not, throw a detailed error containing recent API logs.
   private statusCodeValidator(actualStatus:number,expectedStatus:number,callingMethod:Function){
     if(actualStatus!==expectedStatus){
          const logs=this.logger.getRecentLogs();
          const error = new Error(`Expected status ${expectedStatus}, but got ${actualStatus}. \n\n Recent logs: \n ${logs}`);
          Error.captureStackTrace(error,callingMethod);
          throw error;
     }
   }

   private getHeades(){
    if(!this.clearAuthFlag)
    {
      this.apiHeaders['Authorization']=this.apiHeaders['Authorization'] || `Token ${this.defaultAuthToken}`;
    }
    return this.apiHeaders;
   }


   // Reset the RequestHandler state so it is ready for the next request.
   private cleanUpFields(){
    this.apiBody={};
    this.apiHeaders={};
    this.queryParams={};
    this.apiPath='';
    this.baseUrl=undefined;
   }

}