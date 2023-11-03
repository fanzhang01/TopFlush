# TopFlush: Public Restroom Review Platform

**TopFlush** provides an advanced solution for users to locate and review public restrooms seamlessly. By leveraging the power of the Google Maps API, it allows users to pinpoint restrooms on a map and furnish detailed reviews. The platform emphasizes cleanliness, accessibility, and the quality of amenities.

## Features

- **Review Integration**: Users can evaluate restrooms on various metrics and even upload images to enhance their reviews.
- **Dynamic Updation**: Restrooms reported as unavailable by multiple users are automatically delisted, ensuring relevancy.
- **Optimized Search**: Users can filter restrooms based on ratings or proximity for a personalized experience.
- **User Authentication**: Users can register for an account, log in, and have personalized experiences based on their account information.
- **Submit Reviews**: Logged-in users can submit reviews for restrooms, sharing their experiences and ratings.
- **Database Seeding**: The application seeds the database with sample data for testing purposes.
- **Session Management**: User sessions are managed with cookies to keep users logged in as they navigate the application.

## Technology Stack

- **Express.js**: Web application framework for Node.js.
- **Mongoose**: MongoDB object modeling tool for Node.js.
- **EJS**: Templating engine for rendering views.
- **express-session**: Middleware for session management.
- **Body Parser**: Middleware for parsing incoming request bodies.

## Database Structure

### Topflush Database Overview

Our application, TopFlush, aims to provide users with a convenient way to find nearby restrooms. We've chosen MongoDB as our NoSQL database for this project. Our data is organized into three primary collections: Users, Restrooms, and Reviews.

#### **Users Collection**

The Users Collection holds detailed information about each user, allowing them to personalize their data, log in, and submit reviews.

| Name            | Type     | Description                                                  |
|-----------------|----------|--------------------------------------------------------------|
| _id             | Object   | Globally unique identifier to represent the user             |
| Email           | String   | User's email (validated for format)                          |
| Username        | String   | Chosen username                                              |
| Gender          | Number   | 1 for Male, 0 for Female                                     |
| Hashed password | String   | User's encrypted login password                              |
| Reviews         | Array    | Contains the IDs of reviews the user has posted              |

#### **Restrooms Collection**

This collection comprises details about restrooms in Hoboken, capturing their locations, capacity, and more. It also provides specific metrics like availability, baby changing facilities, and sanitary product provision.

| Name      | Type       | Description                                                                 |
|-----------|------------|-----------------------------------------------------------------------------|
| _id       | Object     | Unique identifier for the restroom                                          |
| Location  | String     | Restroom location                                                           |
| Capacity  | Number     | Maximum occupancy                                                           |
| Reviews   | Array      | List of review IDs related to this restroom                                 |
| Rating    | String     | Cumulative rating (from 1-5)                                                |
| Metrics   | Subdocument| Object detailing various metrics like restroom availability and amenities    |

#### **Reviews Collection**

The Reviews Collection centralizes all the feedback submitted by users, detailing their experiences and ratings for specific restrooms.

| Name       | Type       | Description                                                          |
|------------|------------|----------------------------------------------------------------------|
| _id        | Object     | Unique identifier for the review                                     |
| ReviewerId | String     | ID of the user who provided the review                               |
| RestroomId | String     | ID of the reviewed restroom                                          |
| Text       | String     | Detailed content of the review                                       |
| Rating     | Number     | Rating given by the user, ranging from 1 to 5                        |
| Metrics    | Subdocument| Object encapsulating various metrics associated with the restroom     |

---

## Setup & Usage

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)

### Installation Steps

1. Download the repository and extract its contents to a desired directory.
2. Navigate to the directory via terminal.
3. Execute `npm install` to fetch the necessary dependencies.
4. Start the application using `node app.js`.

Experience a hassle-free way to evaluate and locate public restrooms with **TopFlush**.
