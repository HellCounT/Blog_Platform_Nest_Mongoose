import { BlogDbClass } from './blogs.types';
import mongoose from 'mongoose';

export class BlogsRepository {
  async createBlog(newBlog: BlogDbClass): Promise<BlogDbClass> {
    const blogInstance = new BlogModel(newBlog);
    await blogInstance.save();
    return newBlog;
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const blogInstance = await BlogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!blogInstance) return false;
    if (name) {
      blogInstance.name = name;
      await PostModel.updateMany(
        { blogId: id },
        {
          $set: {
            blogName: name,
          },
        },
      );
    }
    if (description) blogInstance.description = description;
    if (websiteUrl) blogInstance.websiteUrl = websiteUrl;
    await blogInstance.save();
    return true;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const blogInstance = await BlogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!blogInstance) return false;
    await blogInstance.deleteOne();
    return true;
  }
}
