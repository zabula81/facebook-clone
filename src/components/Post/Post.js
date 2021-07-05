import React, { useState, useEffect } from "react";
import "./Post.css";
import { Avatar } from "@material-ui/core";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ModeCommentIcon from "@material-ui/icons/ModeComment";
import NearMeIcon from "@material-ui/icons/NearMe";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CommentSender from "../CommentSender/CommentSender";
import db from "../utility/firebase";
import Comment from "../Comment/Comment";
import { useStateValue } from "../utility/StateProvider";
import moment from "moment";

function Post({
  thumb,
  postId,
  profilePic,
  image,
  username,
  timestamp,
  message,
}) {
  const [{ user }, dispatch] = useStateValue();

  const [like, setLike] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setLike(thumb);
  }, []);

  useEffect(() => {
    let comments;
    if (postId) {
      comments = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
    }
    return () => {
      comments();
    };
  }, [postId]);

  const onClickAddComment = () => {
    setIsVisible(!isVisible);
  };
  const addLike = () => {
    let newLike = [...like, user.uid];
    db.collection("posts").doc(postId).update({
      likes: newLike,
    });
    setLike(newLike);
  };

  const removeLike = () => {
    let filterItem = like.filter((item) => item !== user.uid);
    db.collection("posts").doc(postId).update({
      likes: filterItem,
    });
    setLike(filterItem);
  };

  return (
    <div className="post">
      <div className="post__top">
        <Avatar src={profilePic} className="post__avatar" />
        <div className="post__topInfo">
          <h3>{username}</h3>
          <p>{new Date(timestamp?.toDate()).toUTCString()}</p>
        </div>
      </div>
      <div className="post__bottom">
        <p>{message}</p>
      </div>
      <div className="post__image">
        <img src={image} alt="" />
      </div>
      <div className="post__options">
        {like.includes(user.uid) ? (
          <div className="post__option" onClick={() => removeLike()}>
            <ThumbUpIcon className="post__like" />
            <p>Like {like?.length}</p>
          </div>
        ) : (
          <div className="post__option" onClick={() => addLike()}>
            <ThumbUpIcon />
            <p>Like {like?.length}</p>
          </div>
        )}

        <div className="post__option" onClick={onClickAddComment}>
          <ModeCommentIcon />
          <p>Comment</p>
        </div>
        <div className="post__option">
          <NearMeIcon />
          <p>Share</p>
        </div>
        <div className="post__option">
          <AccountCircleIcon />
          <ExpandMoreIcon />
        </div>
      </div>
      <div className="post__commentContent">
        {isVisible && <CommentSender postId={postId} />}
        <div className="post__coments">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              content={comment.text}
              profilePic={comment.avatar}
              date={moment(comment.timestamp).format("MMM Do YY, h:mm:ss a")}
              userName={comment.user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Post;
