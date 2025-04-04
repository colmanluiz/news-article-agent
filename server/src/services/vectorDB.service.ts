import mongoose, { Schema, Document } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export interface IArticle extends Document {
  title: string;
  content: string;
  url: string;
  date: string; // change to Date
  embeddings: number[];
}

const ArticleSchema: Schema = new Schema<IArticle>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  embeddings: { type: [Number], default: [] },
});

export const Article = mongoose.model("Article", ArticleSchema);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("connected to MongoDB.");
  } catch (error) {
    console.error("failed to connecting to MongoDB, error: ", error);
    process.exit(1);
  }
};

export const storeArticle = async (articleData: {
  title: string;
  content: string;
  url: string;
  date: string;
}) => {
  try {
    const article = new Article(articleData);

    const savedArticle = await article.save();
    console.log("article saved with success! ID: ", savedArticle._id);

    return savedArticle;
  } catch (error) {
    console.error("error storing article: ", error);
    throw new Error(`Failed to store article: ${error}`);
  }
};
