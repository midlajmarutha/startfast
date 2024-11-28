import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { z } from "zod";

// Helper function to handle command execution
const runCommand = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
            } else if (stderr) {
                resolve(`Stderr: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

// Define the type for environment variables
type EnvVariables = Record<string, string>;
export type Action = {
    tool:"CREATE_FILE"| "CREATE_FOLDER"|"DELETE_FILE"|"DELETE_FOLDER"|"READ_FILE"|"WRITE_FILE"|"RUN_COMMAND"|"ADD_DEPENDENCY"|"REMOVE_DEPENDECY"|"CREATE_ENV"|"INIT_GIT",
    args:any
}

// const tool = {
//     /**
//      * Creates a file with the specified content.
//      * @param filePath - Path to the file.
//      * @param content - Content to write (default is an empty string).
//      */
//     CREATE_FILE: (filePath: string, content: string = ""): void => {
//         fs.writeFileSync(filePath, content, "utf8");
//         console.log(`File created: ${filePath}`);
//     },

//     /**
//      * Creates a folder at the specified path.
//      * @param folderPath - Path to the folder.
//      */
//     CREATE_FOLDER: (folderPath: string): void => {
//         fs.mkdirSync(folderPath, { recursive: true });
//         console.log(`Folder created: ${folderPath}`);
//     },

//     /**
//      * Deletes a file at the specified path.
//      * @param filePath - Path to the file.
//      */
//     DELETE_FILE: (filePath: string): void => {
//         fs.unlinkSync(filePath);
//         console.log(`File deleted: ${filePath}`);
//     },

//     /**
//      * Deletes a folder at the specified path.
//      * @param folderPath - Path to the folder.
//      */
//     DELETE_FOLDER: (folderPath: string): void => {
//         fs.rmSync(folderPath, { recursive: true, force: true });
//         console.log(`Folder deleted: ${folderPath}`);
//     },

//     /**
//      * Reads the content of a file.
//      * @param filePath - Path to the file.
//      * @returns File content as a string.
//      */
//     READ_FILE: (filePath: string): string => {
//         const content = fs.readFileSync(filePath, "utf8");
//         console.log(`File read: ${filePath}`);
//         return content;
//     },

//     /**
//      * Writes content to a file.
//      * @param filePath - Path to the file.
//      * @param content - Content to write.
//      */
//     WRITE_FILE: (filePath: string, content: string): void => {
//         fs.writeFileSync(filePath, content, "utf8");
//         console.log(`File updated: ${filePath}`);
//     },

//     /**
//      * Runs a shell command.
//      * @param command - Command to run.
//      * @returns A promise that resolves with the command's output.
//      */
//     RUN_COMMAND: async (command: string): Promise<string> => {
//         console.log(`Running command: ${command}`);
//         return await runCommand(command);
//     },

//     /**
//      * Adds a dependency to a project using npm.
//      * @param dependency - Name of the dependency.
//      * @param isDev - Whether to install as a dev dependency.
//      */
//     ADD_DEPENDENCY: async (dependency: string, isDev: boolean = false): Promise<void> => {
//         const flag = isDev ? "--save-dev" : "--save";
//         await tool.RUN_COMMAND(`npm install ${flag} ${dependency}`);
//         console.log(`Dependency added: ${dependency}`);
//     },

//     /**
//      * Removes a dependency from a project using npm.
//      * @param dependency - Name of the dependency.
//      */
//     REMOVE_DEPENDENCY: async (dependency: string): Promise<void> => {
//         await tool.RUN_COMMAND(`npm uninstall ${dependency}`);
//         console.log(`Dependency removed: ${dependency}`);
//     },

//     /**
//      * Initializes a Git repository in the current directory.
//      */
//     INIT_GIT: async (): Promise<void> => {
//         await tool.RUN_COMMAND("git init");
//         console.log("Git repository initialized.");
//     },

//     /**
//      * Creates a `.env` file with specified environment variables.
//      * @param envVariables - Key-value pairs of environment variables.
//      */
//     CREATE_ENV: (envVariables: EnvVariables): void => {
//         const envContent = Object.entries(envVariables)
//             .map(([key, value]) => `${key}=${value}`)
//             .join("\n");
//         tool.CREATE_FILE(".env", envContent);
//         console.log("Environment variables set.");
//     },
// };

export default tool;


type ToolsCollection<T extends Record<string, z.ZodObject<any>>> = {
    [K in keyof T]: DynamicStructuredTool<T[K]>;
  };

const toolSchemas = {
    WRITE_FILE : z.object({
        filePath:z.string().describe("The path to create file"),
        content:z.string().describe("The content to put inside file")
    })
}

export const tools: ToolsCollection<typeof toolSchemas> = {
    WRITE_FILE: tool(
        (input)=>{
            fs.writeFileSync(input.filePath, input.content, "utf8");
            console.log(`File created at: ${input.filePath}`);
          return `File created at: ${input.filePath}`;
        },
        {
            name:"WRITE_FILE",
            description:"creates file with the given content inside",
            schema:toolSchemas.WRITE_FILE
        }
    ),

}

