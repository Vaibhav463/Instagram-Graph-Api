import React, { useState } from 'react';
import axios from 'axios';
import "../Style/YouTubeChannelVideos.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
const YouTubeChannelVideos = () => {
    const [channelId, setChannelId] = useState('');
    const [videos, setVideos] = useState([]);

    const handleChange = (e) => {
        setChannelId(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAaZHSwbz3F_J4laD82A-WKgbg-DcfmBmk&channelId=${channelId}&part=snippet,id&order=date&maxResults=90`
            );
            console.log(response, "data")

            if (response.data.items.length === 0) {
                setVideos([]);
            } else {
                const videoIds = response.data.items.map((video) => video.id.videoId).join(',');
                const videoDetailsResponse = await axios.get(
                    `https://www.googleapis.com/youtube/v3/videos?key=AIzaSyAaZHSwbz3F_J4laD82A-WKgbg-DcfmBmk&part=snippet,statistics&id=${videoIds}`
                );
                console.log(response.data, "data")
                const videosWithData = response.data.items.map((video, index) => {
                    const statistics = videoDetailsResponse.data.items[index]?.statistics || {};
                    return {
                        ...video,
                        statistics,
                        publishedTime: video.snippet.publishedAt,
                        publishedAt: video.snippet.publishedAt
                    };
                });

                setVideos(videosWithData);
            }
        } catch (error) {
            console.error('Error fetching videos: ', error);
            setVideos([]);
        }
    };

    return (
        <div>
            <div className="youtube-header">
                <div> <FontAwesomeIcon icon={faYoutube} className="youtube-icon" /></div>
                <div className='youtube-heading'> <h1 >YouTube</h1></div>
            </div>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter Channel ID:
                    <input type="text" value={channelId} onChange={handleChange} />
                </label>
                <button type="submit">Fetch Videos</button>
            </form>

            <div className="video-cards">
                {videos.length === 0 ? (
                    <p>No videos found for the provided channel ID.</p>
                ) : (
                    videos.map((video) => (
                        <div key={video.id.videoId} className="video-card">
                            <h3>Video Title: <span>{video.snippet.title}</span></h3>
                            <p>Video Description: <span>{video.snippet.description}</span></p>
                            <p>Channel: <span>{video.snippet.channelTitle}</span></p>
                            <p>Views: <span>{video.statistics ? video.statistics.viewCount : 'N/A'}</span></p>
                            <p>Likes: <span>{video.statistics ? video.statistics.likeCount : 'N/A'}</span></p>
                            <p>Time of Upload: {new Date(video.publishedTime).toLocaleString()}</p>
                            <p>Time of Upload: {new Date(video.publishedAt).toLocaleString()}</p>

                            <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                title={video.snippet.title}
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default YouTubeChannelVideos;




// API Key: AIzaSyAaZHSwbz3F_J4laD82A-WKgbg-DcfmBmk

// Youtube Id for testing: UCgorjGHb6j1j2BRNsaiAY-g
// Uploads Id for testing: UUgorjGHb6j1j2BRNsaiAY-g


// 2nd Youtube Id for testing: UC1M6N5LUj3c1JhiZXiNDq3A
// uploads Id: UU1M6N5LUj3c1JhiZXiNDq3A

// https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&id=UU1M6N5LUj3c1JhiZXiNDq3A&maxResults=25&key=AIzaSyAaZHSwbz3F_J4laD82A-WKgbg-DcfmBmk


