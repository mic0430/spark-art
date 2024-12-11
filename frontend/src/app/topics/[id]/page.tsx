"use client";

import { ArtCard } from "@/lib/components/client";
import { Artwork, Topic } from "@/lib/models";
import { ArtRepo, TopicRepo } from "@/repo";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TopicPage({ params }: { params: { id: string } }) {
    const [modalOpen, setModalOpen] = useState(false);

    const topicId = parseInt(params.id);
    if (isNaN(topicId)) {
        window.location.href = "/topics";
    }

    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [topic, setTopic] = useState<Topic>({
        id: 0,
        text: "",
        creatorId: 0,
        creatorName: "",
        creatorIconUrl: "",
        responses: 0,
        createdAt: new Date().toDateString()
    });

    useEffect(() => {
        TopicRepo.getTopicByID(topicId).then((p) => {
            if (p) {
                setTopic(p);
            }
        }).catch((err) => console.error(err));
        ArtRepo.getArtworksByTopic(topicId).then((artworks) => setArtworks(artworks)).catch((err) => console.error(err));
    }, [topicId]);

    const onPublishArt = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const title = formData.get("title") as string;
        const image = formData.get("image") as File | null;

        if (!title || !image || image.size === 0) {
            alert("Please fill in all fields");
            return;
        }

        form.reset();

        ArtRepo.createArtwork(topicId, title, image).then((artwork) => {
            setArtworks((prev) => {
                const newArtworks = [...prev];
                newArtworks.unshift(artwork);
                return newArtworks;
            });
            setModalOpen(false);
        }).catch((err) => console.error(err));
    };

    return (
        <main className="mx-36">
            <h1 className="text-2xl pt-8 text-indigo-500 font-bold">{topic.text}</h1>
            <div className="mt-2 flex items-center space-x-2">
                <Image src={topic.creatorIconUrl} width={40} height={40} className="rounded-full h-12 w-12" alt={""} />
                <span className="text-gray-500">
                    <a href={"/users/"+topic.creatorId}>{topic.creatorName}</a>
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-500">{new Date(topic.createdAt).toDateString()}</span>
            </div>
            <div className="mt-2">
                <button onClick={() => setModalOpen(!modalOpen)} className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600">
                    Publish New Artwork
                </button>
            </div>
            <h2 className="text-xl text-indigo-500 font-semibold mt-2">Responses:</h2>
            <div className="grid grid-cols-4 mx-2 gap-4 mt-2">
                {artworks.map(artwork => <ArtCard key={artwork.id} artwork={artwork} displayAuthor={true} />)}
            </div>
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow w-1/4 px-8 py-4">
                        <form onSubmit={onPublishArt}>
                            <div>
                                <label className="text-indigo-600 font-semibold" htmlFor="title">Title</label>
                                <br />
                                <input className="bg-gray-100 mt-2 px-2 py-1 rounded w-full" name="title" type="text" placeholder="Enter title here" />
                            </div>
                            <div className="mt-6">
                                <label className="text-indigo-600 font-semibold" htmlFor="image">Image</label>
                                <br />
                                <input className="bg-gray-100 mt-2 px-2 py-1 rounded w-full" name="image" type="file" accept="image/*" />
                            </div>
                            <div className="mt-6">
                                <button className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600" type="submit">Publish</button>
                                <button className="text-gray-700 px-2 py-1 rounded ml-2" onClick={() => setModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}