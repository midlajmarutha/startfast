#! /usr/bin/env node
import { input } from "@inquirer/prompts"
import {ChatGroq} from "@langchain/groq"
import {ChatPromptTemplate} from "@langchain/core/prompts"
import dotenv from "dotenv"
import {StringOutputParser} from "@langchain/core/output_parsers"
import {InMemoryChatMessageHistory} from "@langchain/core/chat_history"
import {RunnableWithMessageHistory} from "@langchain/core/runnables"

import { DynamicStructuredTool, DynamicStructuredToolInput, tool } from "@langchain/core/tools"
import { exec } from "child_process"
import fs from "fs"
import { z } from "zod"
import { ToolDefinition } from "@langchain/core/language_models/base"
import { tools } from "./tools"
// import { systemPrompt } from "./prompts"

dotenv.config();

let model = new ChatGroq({
    model:"llama-3.1-8b-instant",
    temperature:0,
}).bindTools([tools.WRITE_FILE])

let parser = new StringOutputParser();

let systemtemplate = `You are an Ai assistant. As an assistant you should help with the humen's daily tasks.`
let prompt = ChatPromptTemplate.fromMessages([
    ["system",systemtemplate],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"]
])




let chain = prompt.pipe(model).pipe(parser);
let messageHistories :Record<string, InMemoryChatMessageHistory> = {}
const config = {
    configurable: {
      sessionId: "abc2",
    },
};
  
let withMessageHistory = new RunnableWithMessageHistory({
    runnable:chain,
    getMessageHistory: async (sessionid)=>{
        if(messageHistories[sessionid] === undefined){
            messageHistories[sessionid] = new InMemoryChatMessageHistory()
        }
        return messageHistories[sessionid];
    },
    inputMessagesKey:"input",
    historyMessagesKey:"chat_history"
})
async function main(){
    // let text = await input({
    //     message:"Prompt:",
        
    // },{
    //     clearPromptOnDone:true,
    // })
    // let response = await withMessageHistory.invoke(
    //     {input:text},
    //     config
    // )
    // console.log(response)
    const res = await model.invoke("Create a html file helloworldfromai.html in the /home/midlaj/Midlaj/Projects/ directory containing the code to a beautful animated landing page website of a shopping bag business.")
    console.log(res)
    if (res.tool_calls && res.tool_calls.length !== 0){
        for (const toolCall of res.tool_calls){
            if(toolCall.name in tools){
                const tool_to_call = tools[toolCall.name as keyof typeof tools]
                try{
                    const validatedParams = tool_to_call.schema.parse(toolCall.args)
                    tool_to_call.invoke(validatedParams)
                } catch (err){
                    console.error("Invalid parameters:", err);
                }
            }else{
                console.log("Invalid Tool call")
            }

        }
    }
    // const actions_to_take = await JSON.parse(response)
    // console.log(actions_to_take)
    // callTool(actions_to_take)
    // main()
}


// function callTool(actions:Action[]){
//     actions.forEach((action, index)=>{
//         // switch (action.tool) {
//         //     case "CREATE_FILE":
//         //         tools[action.tool]
//         //     case "CREATE_FOLDER":
//         //     case "DELETE_FILE":
//         //     case "DELETE_FOLDER":
//         //     case "READ_FILE":
//         //     case "WRITE_FILE":
//         //     case "RUN_COMMAND":
//         //     case "ADD_DEPENDENCY":
//         //     case "REMOVE_DEPENDECY":
//         //     case "CREATE_ENV":
//         //     case "INIT_GIT":
//         // }
//         const action_to_take = tools[action.tool]
//         return action_to_take(...action.args)
//     })
// }
console.log("ctrl+c to exit\n")
main();


const hello = {
    hello:()=>{}
}

console.log(hello["hello"])
