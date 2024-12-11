"use client";

import { CommentIcon, ThumbsUpIcon } from '@/lib/icons';
import { Artwork } from '@/lib/models';
import { ArtRepo } from '@/repo';
import Image from 'next/image';
import { useState } from 'react';

type ArtCardProps = {
    artwork: Artwork;
    displayTopic?: boolean;
    displayAuthor?: boolean;
}

export default function ArtCard(props: ArtCardProps) {
    const [artwork, setArtwork] = useState<Artwork>(props.artwork);

    const handleLike = () => {
        if (!artwork.isLiked) {
            ArtRepo.likeArtwork(artwork.id).then(() => {
                setArtwork({ ...artwork, likes: artwork.likes + 1, isLiked: true });
            });
        } else {
            ArtRepo.unlikeArtwork(artwork.id).then(() => {
                setArtwork({ ...artwork, likes: artwork.likes - 1, isLiked: false });
            });
        }
    };

    return (
        <div className="items-center flex flex-col justify-center shadow">
            <div className="flex flex-col items-center py-4 px-4">
                <a href={"/topics/" + artwork.topicId + "/art/" + artwork.id} className="mb-2">
                    <Image src={artwork.imageUrl} alt="" width={150} height={150} className="hover:scale-105 transition duration-150" />
                </a>
                <h3 className="text-lg py-1 w-full text-center">{artwork.title}</h3>
                <div className="mb-2 text-center">
                    {(props.displayAuthor != null && props.displayAuthor) && 
                        <p>By:
                            <a href={"/users/" + artwork.authorId} className="ml-1 text-blue-600 hover:text-purple-500 transition ease-in-out duration-150">
                                {artwork.authorName}
                            </a>
                        </p>
                    }
                    {(props.displayTopic != null && props.displayTopic) && 
                        <p>For topic:
                            <a href={"/topics/" + artwork.topicId} className="ml-1 text-blue-600 hover:text-purple-500 transition ease-in-out duration-150">
                                {artwork.topicText}
                            </a>
                        </p>
                    }
                </div>
                <div className="flex justify-center space-x-4 items-center">
                    <button onClick={handleLike} className={"p-1 rounded-md flex space-x-1 item-center border-2 border-blue-500 " + (artwork.isLiked ? "bg-blue-500 text-white" : "text-blue-500")}>
                        <span>
                            {artwork.likes}
                        </span>
                        <ThumbsUpIcon width={20} height={20} color={artwork.isLiked ? "#ffffff" : "#3b82f6"} />
                    </button>
                    <span className="py-1 flex text-gray-600 space-x-1 items-center">
                        <span>{artwork.comments}</span>
                        <CommentIcon width={20} height={20} color="#4b5563" />
                    </span>
                </div>
            </div>
        </div>
    );
}