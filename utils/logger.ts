

// Simple logger used to capture details from API requests and responses.
export class APILogger {
    private recentLogs: any[]  = [];

    // Record request metadata including method, URL, headers, and optional body.
    logRequest(method:string,url:string,headers:Record<string,string>,body?:any) {
        const logEntry = {method,url,headers,body}
        this.recentLogs.push({type:'Request Details', data:logEntry})
    }

    // Record response metadata including status code and optional body.
    logResponse(statusCode:number,body?:any) {
        const logEntry = {statusCode,body}
        this.recentLogs.push({type:'Response Details', data:logEntry})
    }

    // Format logged request and response entries as a readable string.
    getRecentLogs(){
        const logs=this.recentLogs.map( log =>{
            return `===${log.type}===\n${JSON.stringify(log.data,null,4)}\n`
        }).join('\n\n');
        return logs;
    }

}