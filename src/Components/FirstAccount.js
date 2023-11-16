import React, { useState, useEffect } from 'react';
import "../Style/FirstAccount.css"

const FirstAccount = () => {
    const [instagramDetails, setInstagramDetails] = useState();
    const [mediaDetailsList, setMediaDetailsList] = useState([]);
    const accessToken = 'EAAJld1YkjG8BO7tDTzxThadZA3Cl9wJ2zZA80xRmX51thZBebzhYgPBm08CvlyFeZAw2ZALLKIsEOTiZBkZCulNDKGfUE9N2TZCxEvZCJuINmWkWEcj1tMSgFngbd3pGkgPACgxoXlzFFRNgGrA4UrMj2g53q0qWj6H9WKKygZAkROz2AQ74MInXFhOmxBaNANuQjn';
    const InstaId = ['17841460873619739']
    const InstaUserName = ['test_account_0011']
    useEffect(() => {
        // Fetch Instagram details
        fetch(`https://graph.facebook.com/v17.0/${InstaId}?fields=business_discovery.username(${InstaUserName}){username,website,name,ig_id,id,profile_picture_url,biography,follows_count,followers_count,media_count,media{comments_count,like_count}}&access_token=${accessToken}`)
            .then(response => response.json())
            .then(data => {
                setInstagramDetails(data.business_discovery);
            })
            .catch(error => console.error('Error fetching Instagram details:', error));

        // Fetch media details
        const mediaIds = ['17952692441648304', '18063766177413781', '18376873465019884', '18228412342234159', '17968438208533915', '18018002203628945', '17879943557914587'];
        const fetchMediaDetails = async () => {
            const mediaDetailsPromises = mediaIds.map(async (mediaId) => {
                const apiUrl = `https://graph.facebook.com/v17.0/${mediaId}?fields=id,media_product_type,media_type,caption,permalink,timestamp,username,media_url,like_count,comments_count,children{media_type,media_url}&access_token=${accessToken}`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                return data;
            });

            const mediaDetails = await Promise.all(mediaDetailsPromises);
            setMediaDetailsList(mediaDetails);
        };

        fetchMediaDetails();
    }, []);

    return (

        <div className='integrated-container'>
            {/* Fetching Intagram Account Details like Username Followers Following etc* */}
            <div className='fetchDetails mt-5 container'>
                <h1 className=' text-center mb-5'>Instagram Details</h1>
                {instagramDetails && (
                    <div className="instadetails ">
                        <div className="card">
                            <div className=" imgname d-flex align-items-center justify-content-between">
                                <h2>{instagramDetails.username}</h2>
                                <img src={instagramDetails.profile_picture_url} alt="Profile" />
                            </div>
                            <div className="details">
                                <p>Name: {instagramDetails.name}</p>
                                <p>Instagram ID: {instagramDetails.id}</p>
                                <p>Biography: {instagramDetails.biography}</p>
                                <p>Total Following: {instagramDetails.follows_count}</p>
                                <p>Total Followers: {instagramDetails.followers_count}</p>
                                <p>Media Uploaded: {instagramDetails.media_count}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fetching Media Details like Post images their likes, comments, caption etc */}
            {mediaDetailsList.length > 0 && (
                <div className="media-card-container mt-5">
                    {/* Render media cards */}
                    {mediaDetailsList.map((media, index) => (
                        <div key={index} className="media-card">
                            {media.media_type === 'IMAGE' && (
                                <img className='card-image-top' src={media.media_url} alt={`Media ${index}`} />
                            )}
                            {media.media_type === 'VIDEO' && (
                                <video className='card-image-top' controls>
                                    <source src={media.media_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {media.media_type === 'CAROUSEL_ALBUM' && media.children && (
                                <div className="carousel">
                                    {console.log('Carousel children data:', media.children.data)}
                                    {media.children.data.map((childMedia, childIndex) => (
                                        <div key={childIndex} className="carousel-item">
                                            {childMedia.media_type === 'IMAGE' && (
                                                <img className='carousel-image' src={childMedia.media_url} alt={`Carousel ${childIndex}`} />
                                            )}
                                            {childMedia.media_type === 'VIDEO' && (
                                                <video className='carousel-image' controls>
                                                    <source src={childMedia.media_url} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="text">
                                <p>Media Type:<span>{media.media_type}</span></p>
                                <p>Uploaded By:<span>{media.username}</span></p>
                                <p>Upload Date: <span >{new Date(media.timestamp).toLocaleString()}</span></p>
                                <p>Caption: <span>{media.caption}</span></p>
                                <p>Like Count: <span>{media.like_count}</span></p>
                                <p>Shared To: <span>{media.media_product_type}</span></p>
                                <p>Comments Count: <span>{media.comments_count}</span></p>
                                <a className='btn' href={media.permalink} target="_blank" rel="noopener noreferrer">
                                    View on Instagram
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FirstAccount;
