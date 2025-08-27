import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    email: { 
        type: String, 
        unique: true 
        },
    password: String, // only for local users

    googleId: String, // only for Google users
    githubId: String, // only for GitHub users

    avatar: String,
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if (!this.username || this.username==="" && this.firstname && this.lastname) {
        this.username = `${this.firstname} ${this.lastname}`.toLowerCase();
    }
    next();
});

const User = mongoose.model("User", userSchema);

export default User;