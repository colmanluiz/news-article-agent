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

export const storeArticle = async (article: {
  title: string;
  content: string;
  url: string;
  date: string;
}) => {
  try {
    if (!article || !article.url) {
      throw new Error("Article or URL is missing");
    }

    const existingArticle = await Article.findOne({ url: article.url });
    if (existingArticle) {
      console.log(
        `Article with URL ${article.url} already exists in database, skipping...`
      );
      return existingArticle;
    }

    const newArticle = new Article({
      title: article.title,
      content: article.content,
      url: article.url,
      date: article.date || new Date().toISOString().split("T")[0],
    });

    await newArticle.save();
    console.log(`Article stored: ${article.title}`);
    return newArticle;
  } catch (error) {
    console.warn("error storing article: ", error);
    throw new Error(`Failed to store article: ${error}`);
  }
};
