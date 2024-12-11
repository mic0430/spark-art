"use client";
import { CommentIcon, ThumbsUpIcon } from "@/lib/icons";
import { ArtComment, Artwork } from "@/lib/models";
import { ArtRepo, CommentRepo } from "@/repo";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Topic({ params }: { params: { id: string, artid: string } }) {
    const artID = parseInt(params.artid);
    if (isNaN(artID)) {
        window.location.href = "/topics";
    }

    const [artwork, setArtwork] = useState<Artwork>({
        id: artID,
        title: "",
        authorId: 0,
        authorName: "",
        authorIconUrl: "",
        topicId: 0,
        topicText: "",
        imageUrl: "",
        likes: 0,
        comments: 0,
        isLiked: false,
        createdAt: new Date().toDateString()
    });

    const [comments, setComments] = useState<ArtComment[]>([]);

    useEffect(() => {
        ArtRepo.getArtworkById(artID).then((a) => {
            if (a) {
                setArtwork(a);
            }
        }).catch((err) => console.error(err));
        CommentRepo.getArtCommentsByArtwork(artID).then((c) => {
            setComments(c);
        }).catch((err) => console.error(err));
    }, [artID]);

    const handleLike = () => {
        ArtRepo.likeArtwork(artwork.id).then(() => {
            if (artwork.isLiked) {
                setArtwork({ ...artwork, likes: artwork.likes - 1, isLiked: false });
            } else {
                setArtwork({ ...artwork, likes: artwork.likes + 1, isLiked: true });
            }
        }).catch((err) => console.error(err));
    };

    const handleWriteComment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget as HTMLFormElement;
        const textarea = form.querySelector("textarea") as HTMLTextAreaElement;
        const text = textarea.value.trim();
        if (text.length === 0) {
            return;
        }

        // disalbe submit button
        const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;
        submitButton.disabled = true;

        CommentRepo.createArtComment(artID, text).then((c) => {
            setComments([c, ...comments]);
            textarea.value = "";
        }).catch((err) => console.error(err)).finally(() => {
            submitButton.disabled = false;
        });
    };

    return (
        <main className="mt-8">
            <h1 className="text-3xl font-bold text-indigo-500 text-center">{artwork.title}</h1>
            <div className="flex justify-center mt-1 items-center space-x-2">
                <a href={"/users/" + artwork.authorId} className="flex items-center space-x-2">
                    <Image src={artwork.authorIconUrl} width={40} height={40} className="rounded-full h-12 w-12" alt={""} />
                    <span className="text-blue-600 hover:text-blue-700">{artwork.authorName}</span>
                </a>
                <span className="text-gray-500 text-sm">
                    {new Date(artwork.createdAt).toDateString()}
                </span>
            </div>
            <h3 className="text-center text-gray-500 text-sm">
                <span className="mr-2">
                    Drawn for:
                </span>
                <a href={"/topics/" + artwork.topicId} className="text-blue-600 hover:text-blue-700">
                    {artwork.topicText}
                </a>
            </h3>
            <div className="flex justify-center mt-2">
                <Image src={artwork.imageUrl} width={500} height={500} alt={""} />
            </div>
            <div className="flex justify-center space-x-4 items-center mt-2">
                <button onClick={handleLike} className={"p-1 rounded-md flex space-x-1 item-center " + (artwork.isLiked ? "bg-blue-500 text-white" : "border-2 border-blue-500 text-blue-500")}>
                    <span>
                        {artwork.likes}
                    </span>
                    <ThumbsUpIcon width={20} height={20} color={artwork.isLiked ? "#ffffff" : "#3b82f6"} />
                </button>
                <span className="py-1 flex text-gray-600 space-x-1 items-center">
                    <span>{comments.length}</span>
                    <CommentIcon width={20} height={20} color="#4b5563" />
                </span>
            </div>
            <h2 className="text-2xl font-bold text-indigo-500 mt-4 text-center">Comments</h2>
            <div className="flex justify-center mt-2">
                <form className="w-2/3 space-y-1" onSubmit={handleWriteComment}>
                    <textarea placeholder="Write a comment..." className="w-full h-20 p-2 bg-gray-100 rounded shadow"></textarea>
                    <button type="submit" className="px-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Send</button>
                </form>
            </div>
            <div className="flex justify-center mt-2 mb-24">
                <ul className="w-2/3 space-y-4">
                    {comments.map(c => (
                        <li key={c.id} className="bg-gray-100 py-2 px-3 rounded shadow">
                            <a href={"/users/" + c.creatorId} className="flex items-center space-x-2">
                                <Image src={c.creatorIconUrl} width={40} height={40} className="rounded-full bg-green-200 h-12 w-12" alt={""} />
                                <span className="text-blue-600 hover:text-blue-700">{c.creatorName}</span>
                            </a>
                            <p>{c.text}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}