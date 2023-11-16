// import React from 'react';
// import { Carousel } from 'react-responsive-carousel';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';

// function MediaCarousel({ media }) {
//   return (
//     <div className="carousel-container">
// <Carousel
//   showArrows={true}
//   showThumbs={true}
//   showStatus={false}
//   infiniteLoop={true}
//   swipeable={true}
//   renderThumbs={() =>
//     media.children.data.map((childMedia) => (
//       <img
//         src={childMedia.media_url}
//         alt="Child Media"
//         className="carousel-image"
//       />
//     ))
//   }
// >
//   {media.children.data.map((childMedia) => (
//     <div key={childMedia.id} className="carousel-item">
//       {childMedia.media_type === 'IMAGE' ? (
//         <img
//           src={childMedia.media_url}
//           alt="Child Media"
//           className="carousel-image"
//         />
//       ) : childMedia.media_type === 'VIDEO' ? (
//         <video controls className="carousel-video">
//           <source src={childMedia.media_url} type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       ) : null}
//     </div>
//   ))}
// </Carousel>

//     </div>
//   );
// }

// export default MediaCarousel;



import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

function MediaCarousel({ media }) {
  return (
    <div className="carousel-container">
      <Carousel
        showArrows={true}
        showThumbs={true}
        showStatus={false}
        infiniteLoop={true}
        swipeable={true}
        dynamicHeight={true}
        emulateTouch={true}
      >
        {media.children.data.map((childMedia) => (
          <div key={childMedia.id} className="carousel-item">
            {childMedia.media_type === 'IMAGE' ? (
              <img
                src={childMedia.media_url}
                alt="Child Media"
                className="carousel-image"
                style={{ width: '100%', height: 'auto' }}
              />
            ) : childMedia.media_type === 'VIDEO' ? (
              <video controls className="carousel-video" style={{ width: '100%', height: 'auto' }}>
                <source src={childMedia.media_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default MediaCarousel;
