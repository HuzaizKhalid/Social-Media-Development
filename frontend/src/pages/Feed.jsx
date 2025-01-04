import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import moment from "moment";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(data);
    };
    fetchPosts();
  }, [token]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">All Posts</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg mb-2">{post.text}</p>
            {post.image && (
              <img
                src={`http://localhost:5000${post.image}`}
                alt=""
                className="rounded-md"
              />
            )}
            <p className="text-sm text-gray-500">
              Posted by {post.user?.name || "Unknown"} •{" "}
              {moment(post.createdAt).fromNow()}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Feed;
