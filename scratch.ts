import mongoose from "mongoose";
import fs from "fs";
import { encrypt, decrypt } from "./lib/crypto.ts";
import { UserKeyModel } from "./models/UserKey.ts";

const env = fs.readFileSync(".env.local", "utf8");
env.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/["']/g, "").trim();
  }
});

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const keys = await UserKeyModel.find({}).lean();
  for (const k of keys) {
    try {
      const dec = decrypt(k.apiKey);
      console.log(`User: ${k.userId}, Provider: ${k.provider}, Active: ${k.isActive}, KeyLength: ${dec.length}, KeyPrefix: ${dec.substring(0, 7)}`);
      
      if (k.provider === "openai" && k.isActive) {
        // test it
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${dec}` }
        });
        console.log(`OpenAI /v1/models status: ${res.status}`);
        if (!res.ok) {
           console.log(await res.text());
        }
      }
    } catch(e) {
      console.log(`Failed to decrypt key for user ${k.userId}`, e);
    }
  }
  process.exit(0);
}
check();
