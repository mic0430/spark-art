import { Artwork, Topic, User } from "@/lib/models"

type getTopicsFilter = {
    sortType?: string;
    search?: string;
};

export type UserRepository = {
    getAuthUser: (token: string) => Promise<User>
    getUserById: (id: number) => Promise<User>
    updateProfileIcon: (id: number, file: File, token: string) => Promise<User>
}

export type ArtRepository = {
    createArtwork: (topidId: number, title: string, image: File) => Promise<Artwork>
    getArtworks: (sortType?: string) => Promise<Artwork[]>
    getArtworkById: (id: number) => Promise<Artwork | undefined>
    getArtworksByTopic: (topicId: number) => Promise<Artwork[]>
    getArtworksByUser: (userId: number) => Promise<Artwork[]>
    getUsersLikedArtworks: (userId: number) => Promise<Artwork[]>
    likeArtwork: (artworkId: number) => Promise<void>
    dislikeArtwork: (artworkId: number) => Promise<void>
    unlikeArtwork: (artworkId: number) => Promise<void>
}

export type TopicRepository = {
    getTopicByID: (id: number) => Promise<Topic | undefined>;
    getTopics: (filter?: getTopicsFilter) => Promise<Topic[]>;
    getTopicsByUser: (userId: number) => Promise<Topic[]>;
    createTopic: (text: string) => Promise<Topic>;
}

