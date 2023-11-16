import React, { useState, useEffect, useCallback, memo } from "react";
import "../Style/DynamicComponent.css";
import * as XLSX from "xlsx";
import MediaCarousel from "./MediaCarousel";

const DynamicComponent = React.memo(({ accessToken }) => {
  // console.log("Access Token in DynamicComponent:", accessToken);
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [postType, setPostType] = useState("image");
  const [isAddPostModalOpen, setAddPostModalOpen] = useState(false);
  const [postLink, setPostLink] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [mediaUploadSuccess, setMediaUploadSuccess] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [displayCommentId, setDisplayCommentId] = useState(null);
  const [displayComments, setDisplayComments] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const [showAccountInsights, setShowAccountInsights] = useState(false);
  const [accountInsights, setAccountInsights] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [visibleMediaCounts, setVisibleMediaCounts] = useState({});

  const handleDisplayComments = useCallback(() => {
    setDisplayComments(!displayComments);
  }, [displayComments]);

  const handleDisplayComment = useCallback(
    (commentId) => {
      if (displayCommentId === commentId) {
        setDisplayCommentId(null);
      } else {
        setDisplayCommentId(commentId);
      }
    },
    [displayCommentId]
  );

  const openAddPostModal = (type) => {
    setPostType(type);
    setAddPostModalOpen(true);
  };

  const toggleStories = () => {
    setShowStories(!showStories);
  };

  const closeAddPostModal = (memo) => {
    setAddPostModalOpen(false);
    setPostLink("");
    setPostCaption("");
  };

  const handlePostLinkChange = (event) => {
    setPostLink(event.target.value);
  };

  const handlePostCaptionChange = (event) => {
    setPostCaption(event.target.value);
  };


  const handleLoadMore = (accountId) => {
    setVisibleMediaCounts(prevCounts => ({
      ...prevCounts,
      [accountId]: (prevCounts[accountId] || 0) + 3
    }));
  };

  const handleAddPost = async (memo) => {
    if (accessToken && selectedAccount) {
      if ((!postLink || !postCaption) && postType !== "image") {
        setMediaUploadError("Link and Caption cannot be empty");
        return;
      }

      try {
        let containerData = {
          caption: postCaption,
          access_token: accessToken,
        };

        if (postType === "image") {
          if (!postLink) {
            setMediaUploadError("Image URL cannot be empty");
            return;
          }
          containerData.image_url = postLink;
        } else if (postType === "video") {
          if (!postLink) {
            setMediaUploadError("Video URL cannot be empty");
            return;
          }
          containerData.video_url = postLink;
          containerData.media_type = "VIDEO";
        }

        setMediaUploadError("Wait Your Media is Uploading");

        // Step 1: Create Container
        const createContainerResponse = await fetch(
          `https://graph.facebook.com/v17.0/${selectedAccount.id}/media`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(containerData),
          }
        );

        if (!createContainerResponse.ok) {
          const errorResponseData = await createContainerResponse.json();
          console.error("Error creating container:", errorResponseData);
          console.log("Error message:", errorResponseData.error.message);
          setMediaUploadError(
            "Error uploading media: " + errorResponseData.error.message
          );
          return;
        }

        const createContainerData = await createContainerResponse.json();
        const containerId = createContainerData.id;
        console.log("Container ID:", containerId);

        // Step 2: Publish Container
        // Add a delay before attempting to publish the video
        setTimeout(async () => {
          const publishContainerResponse = await fetch(
            `https://graph.facebook.com/v17.0/${selectedAccount.id}/media_publish?creation_id=${containerId}&access_token=${accessToken}`,
            {
              method: "POST",
              body: JSON.stringify({}),
            }
          );

          if (!publishContainerResponse.ok) {
            try {
              const errorResponseData = await publishContainerResponse.json();
              console.error("Error publishing container:", errorResponseData);

              // Log the status and response data
              console.error(
                "Response status:",
                publishContainerResponse.status
              );
              console.error("Response data:", errorResponseData);

              const errorMessageFromAPI =
                (errorResponseData.error &&
                  errorResponseData.error.error_user_msg) ||
                errorResponseData.error_user_msg ||
                errorResponseData.message ||
                "";
              const genericErrorMessage = "An error occurred while publishing";
              const finalErrorMessage = errorMessageFromAPI
                ? `${genericErrorMessage}: ${errorMessageFromAPI}`
                : genericErrorMessage;

              console.log("Final error message:", finalErrorMessage); // Log the final error message to make sure it's being correctly created
              setMediaUploadError(finalErrorMessage);
            } catch (error) {
              console.error("Error parsing error response:", error);
              const genericErrorMessage = "An error occurred while publishing";
              setMediaUploadError(genericErrorMessage);
            }
            return;
          }

          // Step 3: Handle Success
          const publishContainerData = await publishContainerResponse.json();
          const mediaId = publishContainerData.id;

          console.log("Published Media ID:", mediaId);
          setMediaUploadSuccess(true);

          // Delay the closing of the modal by 1 second after displaying the success message
          setTimeout(() => {
            setMediaUploadSuccess(false);
            closeAddPostModal();
          }, 5000);

          setMediaUploadError(null);
        }, 10000); // Wait for 10 seconds before attempting to publish the video
      } catch (error) {
        console.error("Error adding/posting:", error);
        setMediaUploadError("Error adding/posting media: " + error.message);
      }
    }
  };

  const handleExportToExcel = (memo) => {
    if (selectedAccount) {
      const mediaExportData = selectedAccount.media?.data.flatMap((media) => {
        const comments =
          media.comments && media.comments.data
            ? media.comments.data.map((comment) => {
              const replies =
                comment.replies && comment.replies.data
                  ? comment.replies.data.map((reply) => ({
                    ReplyUsername: reply.username || "",
                    ReplyText: reply.text || "",
                  }))
                  : [];
              return {
                CommentUsername: comment.username || "",
                CommentText: comment.text || "",
                Replies: JSON.stringify(replies),
              };
            })
            : [];

        return {
          InstagramId: selectedAccount.id,
          InstagramUsername: selectedAccount.username,
          MediaId: media.id,
          MediaIsA: media.media_product_type || "",
          MediaCaption: media.caption || "",
          MediaType: media.media_type || "",
          MediaUrl: media.media_url || "",
          Permalink: media.permalink || "",
          Timestamp: media.timestamp || "",
          LikeCount: media.like_count || 0,
          UploadedBy: media.username || "",
          CommentsCount: media.comments_count || 0,
          Comments: JSON.stringify(comments),
          
        };
      });

      const storiesExportData = selectedAccount.stories?.map((story) => ({
        InstagramId: selectedAccount.id,
        InstagramUsername: selectedAccount.username,
        StoryId: story.id,
        StoryMediaType: story.media_type || "",
        StoryMediaIsA: story.media_product_type || "",
        StoryMediaUrl: story.media_url || "",
        StoryTimestamp: story.timestamp || "",
        LikeCount: story.like_count || 0,
      }));

      const combinedExportData = [...mediaExportData, ...storiesExportData];
      if (combinedExportData && combinedExportData.length > 0) {
        const ws = XLSX.utils.json_to_sheet(combinedExportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MediaAndStoriesData");
        XLSX.writeFile(wb, "media_and_stories_data.xlsx");
      } else {
        console.log("No media or story data to export");
      }
    }
  };
  const handleReplyComment = useCallback((commentId) => {
    setReplyToCommentId(commentId);
  }, []);
  const handleSubmitReply = useCallback(
    async (commentId) => {
      if (accessToken && replyMessage) {
        try {
          const response = await fetch(
            `https://graph.facebook.com/${commentId}/replies?message=${replyMessage}&access_token=${accessToken}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const responseData = await response.json();
          console.log("Response from server:", responseData);
          if (response.ok) {
            console.log("Reply sent successfully");
            setReplyMessage("");
            setReplyToCommentId(null);
          } else {
            console.error("Error sending reply:", response.statusText);
          }
        } catch (error) {
          console.error("Error sending reply:", error);
        }
      }
    },
    [accessToken, replyMessage]
  );
  const fetchInsights = useCallback(
    async (instagramId) => {
      if (accessToken && instagramId) {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v17.0/${instagramId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${accessToken}`
          );
          const data = await response.json();
          setInsightsData(data.data);
        } catch (error) {
          console.error("Error fetching insights:", error);
          setInsightsData(null);
        }
      }
    },
    [accessToken]
  );
  const toggleInsights = useCallback(() => {
    setShowInsights(!showInsights);
  }, [showInsights]);
  const fetchAccountInsights = useCallback(
    async (MediaId) => {
      if (accessToken && MediaId) {
        try {
          const metrics = [
            "impressions",
            "reach",
            "phone_call_clicks",
            "text_message_clicks",
            "website_clicks",
            // "get_directions_clicks",
            // "email_contacts",
            // "audience_gender_age",
            // "audience_locale",
            // "audience_country",
            // "audience_city",
            // "online_followers",
            // "accounts_engaged",
            // "total_interactions",
            // "likes",
            // "comments",
            // "shares",
            // "saves",
            // "replies",
            // "engaged_audience_demographics",
            // "reached_audience_demographics",
            // "follower_demographics",
            // "follows_and_unfollows",
            // "profile_links_taps"
          ];
          const response = await fetch(
            `https://graph.facebook.com/v17.0/${MediaId}/insights?metric=${metrics.join(
              ","
            )}&period=day&access_token=${accessToken}`
          );
          const data = await response.json();
          if (data.error) {
            console.error("Error fetching account insights:", data.error);
            setAccountInsights([]);
          } else {
            // console.log("Fetched account insights data:", data);
            // Create an object to store the insights data
            const insightsData = {};
            // Add the fetched insights data to the object
            data.data.forEach((insight) => {
              insightsData[insight.name] = insight.values[0]?.value;
            });

            // Update the accountInsights state using the previous state
            setAccountInsights((prevInsights) => ({
              ...prevInsights,
              ...insightsData,
            }));
          }
        } catch (error) {
          console.error("Error fetching account insights:", error);
          setAccountInsights({});
        }
      }
    },
    [accessToken]
  );

  useEffect(
    (memo) => {
      if (accessToken) {
        fetch(
          `https://graph.facebook.com/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
        )
          .then((response) => response.json())
          .then((data) => {
            // console.log("Response from fetching accounts:", data);
            const instagramAccountPromises = data.data.map((page) => {
              if (page.instagram_business_account) {
                return fetch(
                  `https://graph.facebook.com/${page.instagram_business_account.id}?fields=username,website,name,ig_id,id,profile_picture_url,biography,followers_count,media_count&access_token=${accessToken}`
                )
                  .then((response) => response.json())
                  .then((instagramAccount) => ({
                    pageId: page.id,
                    instagramId: instagramAccount.id,
                    instagramUsername: instagramAccount.username,
                    instagramname: instagramAccount.name,
                    profilePictureUrl: instagramAccount.profile_picture_url,
                    media: instagramAccount.media,
                    MediaId: instagramAccount.id,
                  }))
                  .catch((error) => {
                    console.error(
                      "Error fetching Instagram account details:",
                      error
                    );
                    return null;
                  });
              } else {
                return null;
              }
            });
            Promise.all(instagramAccountPromises)
              .then((instagramAccounts) =>
                setInstagramAccounts(
                  instagramAccounts.filter((account) => account)
                )
              )
              .catch((error) =>
                console.error("Error fetching Instagram accounts:", error)
              );
          })
          .catch((error) =>
            console.error("Error fetching Instagram accounts:", error)
          );
      }
    },
    [accessToken]
  );
  useEffect(() => {
    if (instagramAccounts.length > 0) {
      fetchAccountInsights(instagramAccounts[0].MediaId);
    }
  }, [fetchAccountInsights, instagramAccounts]);

  const toggleAccountInsights = useCallback(() => {
    setShowAccountInsights(!showAccountInsights);
  }, [showAccountInsights]);

  const handleShowDetails = (instagramId) => {
    if (accessToken) {
      const detailsUrl = `https://graph.facebook.com/v17.0/${instagramId}?fields=id,username,website,biography,followers_count,profile_picture_url,follows_count,media_count,media{caption,media_type,username,media_url,permalink,media_product_type,timestamp,like_count,comments_count,comments{id,name,username,text,replies},children{media_type,media_url}}&access_token=${accessToken}`;
      fetch(detailsUrl)
        .then((response) => response.json())
        .then(async (data) => {
          setSelectedAccount(data);
          // Fetch story media IDs
          const storyMediaUrl = `https://graph.facebook.com/v17.0/${instagramId}/stories?fields=id&access_token=${accessToken}`;
          try {
            const storyMediaResponse = await fetch(storyMediaUrl);
            const storyMediaData = await storyMediaResponse.json();
            const storyMediaIds = storyMediaData.data.map((story) => story.id);

            // Fetch story details using the IDs
            const storyDetailsPromises = storyMediaIds.map((storyId) => {
              const storyDetailsUrl = `https://graph.facebook.com/v17.0/${storyId}?fields=id,media_product_type,permalink,media_url,media_type,like_count,timestamp&limit=10&access_token=${accessToken}`;
              return fetch(storyDetailsUrl).then((response) => response.json());
            });

            const storyDetails = await Promise.all(storyDetailsPromises);

            // Add story details to the selected account
            setSelectedAccount((prevAccount) => ({
              ...prevAccount,
              stories: storyDetails,
            }));
          } catch (error) {
            console.error("Error fetching story media and details:", error);
          }
        })
        .catch((error) => {
          console.error("Error fetching media details:", error);
          setSelectedAccount(null);
        });
      fetchInsights(instagramId);
    }
  };

  return (
    <div className="container">
      <h2 className="text-center">Your Instagram Accounts</h2>
      <ul className="list-unstyled mt-5 d-flex justify-content-around">
        {instagramAccounts.map((account) => (
          <li key={account.instagramId}>
            <div className="account mb-5">
              <p>
                Page id: {account.pageId} <br />
                Instagram id: {account.instagramId}
                <br></br>name: {account.instagramname}
                <br></br>Instagram username: {account.instagramUsername}
              </p>
              <button
                className="btn btn-info"
                onClick={() => handleShowDetails(account.instagramId)}
              >
                Show Details and Media
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedAccount && (
        <div className="selected-account">
          <div className="details-header">
            <h3 className="text-center mb-4">
              Selected Instagram Account Details
            </h3>
          </div>
          <div className="imgandname d-flex align-items-center justify-content-between">
            <p className="text-white bg-dark p-3 rounded-circle">
              {selectedAccount.username}
            </p>
            <img
              src={selectedAccount.profile_picture_url || "placeholder.png"}
              alt="Profile"
              className="profile-picture"
            />
          </div>
          <div className="instgramdetails">
            <p className="details-label">Instagram id: {selectedAccount.id}</p>
            <p className="details-value details-link">
              Website:{" "}
              <a
                href={selectedAccount.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedAccount.website || "NA"}
              </a>
            </p>
            <p className="details-label">
              Biography: {selectedAccount.biography || "NA"}
            </p>
            <p className="details-label">
              Followers: {selectedAccount.followers_count}
            </p>
            <p className="details-label">
              Following: {selectedAccount.follows_count}
            </p>
            <p className="details-label">
              Media Count: {selectedAccount.media_count}
            </p>

            <button className="btn btn-secondary mt-2" onClick={toggleInsights}>
              {showInsights ? "Hide Insights" : "Show Insights"}
            </button>

            {showInsights && insightsData && (
              <div className="insights mt-3">
                <h4>Insights</h4>
                <p>Impressions: {insightsData[0].values[0].value}</p>
                <p>Reach: {insightsData[1].values[0].value}</p>
                <p>Profile Views: {insightsData[2].values[0].value}</p>
              </div>
            )}
          </div>
          <h4 className="text-center mt-5">Media</h4>
          <div className="media-container">
          {selectedAccount.media?.data.slice(0, visibleMediaCounts[selectedAccount.id] || 3).map((media) => (
              <div key={media.id} className="media-card">
                {media.media_type === "IMAGE" ? (
                  <img
                    src={media.media_url}
                    alt="Media"
                    className="media-image card-img-top img-fluid"
                  />
                ) : media.media_type === "VIDEO" ? (
                  <video
                    controls
                    className="media-video card-img-top img-fluid"
                  >
                    <source src={media.media_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : media.media_type === "CAROUSEL_ALBUM" ? (
                  <MediaCarousel media={media} /> 
                ) : null}


                <p className="media-details-label mt-2">Media Id: {media.id}</p>
                <p className="media-details-label">
                  uploaded By: {media.username}
                </p>
                <p className="media-details-label">
                  Media is a: {media.media_product_type}
                </p>
                <p className="media-details-label">
                  Media Type: {media.media_type}
                </p>
                <p className="media-details-label">Caption: {media.caption || "No Caption"} </p>
                <p className="media-details-label">
                  Click the link to view on Instagram
                </p>
                <a
                  className="media-details-link"
                  href={media.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Permalink: {media.permalink}
                </a>
                <p className="media-details-label mt-2">
                  {/* Timestamp: {media.timestamp} */}
                  Time of Upload: {new Date(media.timestamp).toLocaleString()}
                </p>
                <p className="media-details-label">
                  Like Count: {media.like_count}
                </p>
                <p className="media-details-label">
                  Comments Count: {media.comments_count}
                </p>

                <button
                  className="btn btn-secondary mt-2"
                  onClick={toggleAccountInsights}
                >
                  {showAccountInsights
                    ? "Hide Account Insights"
                    : "Show Account Insights"}
                </button>

                {showAccountInsights &&
                  Object.keys(accountInsights).length > 0 && (
                    <div className="insights mt-3">
                      <h4>Account Insights</h4>
                      {Object.entries(accountInsights).map(
                        ([name, value], index) => (
                          <p key={index}>
                            {name}:{" "}
                            {value !== undefined ? value : "Not available"}
                          </p>
                        )
                      )}
                    </div>
                  )}

                <p className="media-details-label mt-2">Comments:</p>
                <div className="media-details-value">
                  <button
                    className="media-details-label btn-warning text-white"
                    onClick={handleDisplayComments}
                  >
                    Comments:
                  </button>
                  {displayComments && (
                    <div className="media-details-value">
                      {media.comments && media.comments.data
                        ? media.comments.data.map((comment, index) => (
                          <div key={comment.id} className="comment">
                            <button
                              className="mt-2 comment-button btn-danger text-white"
                              onClick={() => handleDisplayComment(comment.id)}
                            >
                              Comment {[index + 1]}: {comment.text}
                            </button>
                            {displayCommentId === comment.id && (
                              <>
                                <p className="comment-text mt-2">
                                  Comment Id: {comment.id}
                                </p>
                                {comment.replies && comment.replies.data && (
                                  <div className="replies">
                                    {comment.replies.data.map(
                                      (reply, replyIndex) => (
                                        <div key={reply.id} className="reply">
                                          <p className="reply-text">
                                            Comment Reply {[replyIndex + 1]}:{" "}
                                            {reply.text}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                                <button
                                  className="reply-button btn-warning text-white"
                                  onClick={() =>
                                    handleReplyComment(comment.id)
                                  }
                                >
                                  Reply
                                </button>
                                {replyToCommentId === comment.id && (
                                  <div className="reply-input">
                                    <input
                                      className="mt-2"
                                      type="text"
                                      value={replyMessage}
                                      onChange={(event) =>
                                        setReplyMessage(event.target.value)
                                      }
                                      placeholder="Enter your reply"
                                    />
                                    <button
                                      className="m-3 submit-reply-button btn-warning text-white"
                                      onClick={() =>
                                        handleSubmitReply(comment.id)
                                      }
                                    >
                                      Submit Reply
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))
                        : "This Post Don't Have Any Comment"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="load-more-button d-flex justify-content-center m-3">
            {selectedAccount.media?.data.length > (visibleMediaCounts[selectedAccount.id] || 3) && (
              <button
                className="btn btn-danger load-more-button w-50"
                onClick={() => handleLoadMore(selectedAccount.id)}
              >
                Load More
              </button>
            )}
          </div>

          <button className="btn btn-secondary mt-2" onClick={toggleStories}>
            {showStories ? "Hide Stories" : "View Stories"}
          </button>

          {showStories && selectedAccount.stories && (
            <div className="stories">
              {selectedAccount.stories.length > 0 ? (
                selectedAccount.stories.map((story) => (
                  <div key={story.id} className="story">
                    <a href={story.media_url} target="_blank" rel="noopener noreferrer">
                      {story.media_type === "VIDEO" ? (
                        <div className="video-container">
                          <video controls className="story-video">
                            <source src={story.media_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          {!story.media_url && (
                            <img
                              src="video-placeholder-icon.png"
                              alt={`Video ${story.id}`}
                              className="video-placeholder"
                            />
                          )}
                        </div>
                      ) : (
                        <img
                          src={story.media_url}
                          alt={`Story ${story.id}`}
                          className="story-image"
                        />
                      )}
                    </a>
                    <p>ID: {story.id}</p>
                    <p>Like Count: {story.like_count}</p>
                    <p>Timestamp: {new Date(story.timestamp).toLocaleString()}</p>
                    <p>Media Type: {story.media_type}</p>
                    <p>Media is a: {story.media_product_type}</p>
                  </div>
                ))
              ) : (
                <p>No story</p>
              )}
            </div>
          )}

          <div className="excelbutton mt-5">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleExportToExcel}
            >
              Export to Excel
            </button>
          </div>
          <div className="add-post-button mt-5">
            <button
              className="btn btn-success btn-lg m-2"
              onClick={() => openAddPostModal("image")}
            >
              Add Image Post
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={() => openAddPostModal("video")}
            >
              Add Video Post
            </button>
            {/* You can add buttons for adding story and carousel posts */}
          </div>

          {isAddPostModalOpen && (
            <div className="modal-overlay">
              <div className="add-post-modal mt-5">
                <h3>Add Post</h3>
                <label>Link of Media: </label>
                <input
                  className="m-2"
                  type="text"
                  value={postLink}
                  onChange={handlePostLinkChange}
                />
                <label>Caption For Media:</label>
                <input
                  className="m-2"
                  type="text"
                  value={postCaption}
                  onChange={handlePostCaptionChange}
                />
                <button className="btn btn-primary m-2" onClick={handleAddPost}>
                  Add Post
                </button>
                <button
                  className="btn btn-secondary m-2"
                  onClick={closeAddPostModal}
                >
                  Cancel
                </button>
                {mediaUploadSuccess && (
                  <div className="success-message">
                    Media upload successful!
                  </div>
                )}
                {mediaUploadError && (
                  <div className="error-message">{mediaUploadError}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
export default memo(DynamicComponent);