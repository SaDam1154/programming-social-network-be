import Post from '../models/post.js';
import Category from '../models/category.js';
import Tag from '../models/tag.js';
import User from '../models/user.js';
import * as imageHandler from '../utils/imageHandler.js';

const getPosts = async (filter) => {
    try {
        const posts = await Post.find()
            .populate('category')
            .populate('tag', 'name')
            .populate('creator', 'name')
            .sort({ createdAt: -1 });

        return posts;
    } catch (err) {
        throw err;
    }
};

const getPost = async (id) => {
    try {
        return await Post.getById(id);
    } catch (err) {
        throw err;
    }
};

const createPost = async ({ title, content, tagId, categoryId, files, userId }) => {
    try {
        await User.getById(userId);
        const category = await Category.getById(categoryId);
        const tag = await Tag.getById(tagId);

        const post = new Post({
            title,
            content,
            tag: tag._id,
            category: category._id,
            creator: userId,
        });

        // upload images
        const uploadedImages = await imageHandler.uploadMultiple(userId, post._id, files);
        post.images = uploadedImages;

        await post.save();

        return post;
    } catch (err) {
        throw err;
    }
};

const updatePost = async ({ postId, title, content, tagId, categoryId, files, userId }) => {
    try {
        const editedPost = await Post.getById(postId);
        await User.getById(userId);

        // Check if user is post's creator
        if (userId.toString() !== editedPost.creator._id.toString()) {
            const error = new Error('User is not the creator');
            error.statusCode = 403;
            throw error;
        }

        // Check category and tag are existing
        if (categoryId) {
            const category = await Category.getById(categoryId);
            editedPost.category = category._id;
        }

        if (tagId) {
            const tag = await Tag.getById(tagId);
            editedPost.category = category._id;
        }

        if (files) {
            // Delete old images
            if (editedPost.images.length > 0) {
                await imageHandler.deleteFolder(imageHandler.path.forPost(userId, editedPost._id.toString()));
            }

            const uploadedImages = await imageHandler.uploadMultiple(userId, editedPost._id, files);
            editedPost.images = uploadedImages;
        }

        if (title) {
            editedPost.title = title;
        }

        if (content) {
            editedPost.content = content;
        }

        await editedPost.save();

        return editedPost;
    } catch (err) {
        throw err;
    }
};

const deleteSavedPost = async (postId, userId) => {
    try {
        const user = await User.getById(userId);
        const post = await Post.getById(postId);
        const updatedSavedPosts = user.savedPosts;
        if (updatedSavedPosts.includes(post._id)) {
            user.savedPosts = updatedSavedPosts.filter((p) => p._id.toString() !== post._id.toString());
            await user.save();
        }

        return user;
    } catch (err) {
        throw err;
    }
};

const deletePost = async (postId, userId) => {
    try {
        const post = await Post.getById(postId);

        // Check if user is post's creator
        if (userId.toString() !== post.creator._id.toString()) {
            const error = new Error('User is not the creator');
            error.statusCode = 403;
            throw error;
        }

        // Delete images
        if (post.images.length > 0) {
            await imageHandler.deleteFolder(imageHandler.path.forPost(userId, post._id.toString()));
        }

        // Delete post in savedPost of all users
        const allUsers = await User.find();
        for (const user of allUsers) {
            await deleteSavedPost(postId, user._id.toString());
        }

        await Post.findByIdAndDelete(post._id);
    } catch (err) {
        throw err;
    }
};

const likePost = async (postId, userId) => {
    try {
        const post = await Post.getById(postId);

        const updatedLikes = post.likes;
        if (!updatedLikes.includes(userId)) {
            updatedLikes.push(userId);
            post.likes = updatedLikes;
            await post.save();
        }

        await post.populate('likes', 'name');

        return post;
    } catch (err) {
        throw err;
    }
};

const unlikePost = async (postId, userId) => {
    try {
        const post = await Post.getById(postId);

        const updatedLikes = post.likes;
        if (updatedLikes.includes(userId)) {
            post.likes = updatedLikes.filter((like) => like.toString() !== userId.toString());
            // updatedLikes = updatedLikes.filter(like => like.toString() !== userId.toString());
            // post.likes = updatedLikes;
            await post.save();
        }

        await post.populate('likes', 'name');

        return post;
    } catch (err) {
        throw err;
    }
};

const viewPost = async (postId, userId) => {
    try {
        const post = await Post.getById(postId);
        const user = await User.getById(userId);

        const updatedViews = post.Views;
        if (!updatedViews.includes(user._id.toString())) {
            updatedViews.push(user._id.toString());
            post.views = updatedViews;
            await post.save();
        }

        return post;
    } catch (err) {
        throw err;
    }
};

const savePost = async (postId, userId) => {
    try {
        const post = await Post.getById(postId);
        const user = await User.getById(userId);

        if (!user.savedPosts.includes(post._id.toString())) {
            user.savedPosts.push(post._id.toString());
            await user.save();
        }

        return user;
    } catch (err) {
        throw err;
    }
};

export {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    viewPost,
    savePost,
    deleteSavedPost,
};
