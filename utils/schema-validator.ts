import fs from 'fs/promises';
import path from 'path';
import Ajv, { JSONSchemaType } from 'ajv';
import { createSchema } from 'genson-js';
import addFormats from 'ajv-formats';


const SCHEMA_BASE_PATH= './response-schemas';
const ajv = new Ajv({allErrors: true});
addFormats(ajv);

export async function validateSchema(dirName:string, fileName:string, responseBody: Object, createSchemaFlag: boolean = false){
    const schemaPath= path.join(SCHEMA_BASE_PATH, dirName, `${fileName}_schema.json`);

    if(createSchemaFlag) await generateNewSchema(dirName, fileName, responseBody, schemaPath);


    const schema= await loadSchema(schemaPath)
    const validate = ajv.compile(schema);

    const valid=validate(responseBody);
    if(!valid){
        throw new Error(
            `Schema validation ${fileName}_schema.json failed:\n`+
            `${JSON.stringify(validate.errors, null, 4)}\n\n`+
            `Actual respomse body: \n`+
            `${JSON.stringify(responseBody,null, 4)}`
        )
    }

}

async function loadSchema(schemaPath:string){
    try{
        const schemaContent = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(schemaContent);
    }
    catch(error: unknown){
        throw new Error(`Failed to load schema file: ${error instanceof Error ? error.message : String(error)}`);
    }
  
}

async function generateNewSchema(dirName:string, fileName:string, responseBody: Object, schemaPath: string){
    try{
        const generatedSchema = createSchema(responseBody);
        await fs.mkdir(path.dirname(schemaPath),{ recursive: true })
        await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 4));
    }
    catch(error: unknown){
       throw new Error(`Failed to create schema file: ${error instanceof Error ? error.message : String(error)}`);      
    }
}