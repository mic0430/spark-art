"use client";

import { ArtCard } from "@/lib/components/client";
import { Artwork, Topic, User } from "@/lib/models";
import { TopicRepo, UserRepo, ArtRepo } from "@/repo";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function UserProfile({ params }: { params: { id: string } }) {
    const [currUser, setCurrUser] = useState<User>({
        id: -1,
        username: "",
        profileImageUrl: "",
        createdAt: "",
    });
    const [user, setUser] = useState<User>({
        id: 0,
        username: "",
        profileImageUrl: "",
        createdAt: "",
    });

    const [activeTab, setActiveTab] = useState("topics");

    const [topics, setTopics] = useState<Topic[]>([]);
    const [drawn, setDrawn] = useState<Artwork[]>([]);
    const [liked, setLiked] = useState<Artwork[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let token = document.cookie.split("; ").find(row => row.startsWith("authtoken"));
        if (!token) {
            throw new Error("No token found");
        }
        token = token.split("=")[1];

        UserRepo.getUserById(parseInt(params.id)).then((user) => {
            if (user) {
                setUser(user);
            }
            
        }).catch((err) => console.error(err));

        UserRepo.getAuthUser(token).then((user) => {
            if (user) {
                setCurrUser(user);
            }
        }).catch((err) => console.error(err));

        TopicRepo.getTopicsByUser(parseInt(params.id)).then((topics) => {
            setTopics(topics);
        }).catch((err) => console.error(err));
    }, [params.id]);

    const onBtnPress = () => {
        fileInputRef.current?.click();
    }

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.item(0);
        if (!file) {
            return;
        }

        let token = document.cookie.split("; ").find(row => row.startsWith("authtoken"));
        if (!token) {
            throw new Error("No token found");
        }
        token = token.split("=")[1];

        UserRepo.updateProfileIcon(user!.id, file, token).then((user) => {
            if (user) {
                setUser(user);
            }
        }).catch((err) => console.error(err));
    }

    const onChangeTab = (tab: string) => {
        setActiveTab(tab);

        if (tab === "topics") {
            TopicRepo.getTopicsByUser(parseInt(params.id)).then((topics) => {
                setTopics(topics);
            }).catch((err) => console.error(err));
        } else if (tab === "drawn") {
            ArtRepo.getArtworksByUser(parseInt(params.id)).then((artworks) => {
                setDrawn(artworks);
            }).catch((err) => console.error(err));
        } else if (tab === "liked") {
            ArtRepo.getUsersLikedArtworks(parseInt(params.id)).then((artworks) => {
                setLiked(artworks);
            }).catch((err) => console.error(err));
        }
    }

    return (
        <main className="mt-8 mx-16">
            <div className="flex items-center">
                <Image src={user?.profileImageUrl} width={150} height={150} className="rounded-full bg-green-200 mr-4 w-36 h-36" alt={""} />
                <div>
                    <h1 className="text-3xl font-bold text-indigo-500">{user?.username}</h1>
                    <p className="text-gray-500">Joined: {new Date(user.createdAt).toDateString()}</p>
                </div>
            </div>
            {user?.id === currUser.id ? (
                <div>
                    <button onClick={onBtnPress} className="ml-7 mt-2 py-1 px-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition ease-in-out d-150">
                        Edit Image
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={onImageChange} />
                </div>
            ) : null}
            <div className="mt-4 flex space-x-6 pb-2 border-b-2">
                <button onClick={() => onChangeTab("topics")} className={"text-lg " + (activeTab == "topics" ? "text-indigo-500" : "")}>
                    Topics
                </button>
                <button onClick={() => onChangeTab("drawn")} className={"text-lg " + (activeTab == "drawn" ? "text-indigo-500" : "")}>
                    Drawn Artworks
                </button>
                <button onClick={() => onChangeTab("liked")} className={"text-lg " + (activeTab == "liked" ? "text-indigo-500" : "")}>
                    Liked Artworks
                </button>
            </div>
            {activeTab === "topics" ? (
                <div className="grid grid-cols-5 gap-4 mt-4">
                    {topics.map(topic => (
                        <div key={topic.id}>
                            <a href={"/topics/" + topic.id}>
                                <div className="shadow rounded-lg px-4 py-2">
                                    <span className="text-gray-500 text-sm">{new Date(topic.createdAt).toDateString()}</span>
                                    <p>{topic.text}</p>
                                    <span className="text-gray-500 text-sm">Responses: {topic.responses}</span>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            ) : null}
            {activeTab === "drawn" ? (
                <div className="grid grid-cols-5 mx-2 mt-4 gap-4">
                    {drawn.map((artwork, idx) => <ArtCard key={idx} artwork={artwork} displayTopic={true} />)}
                </div>
            ) : null}
            {activeTab === "liked" ? (
                <div className="grid grid-cols-5 mx-2 mt-4 gap-4">
                    {liked.map((artwork, idx) => <ArtCard key={idx} artwork={artwork} displayAuthor={true} displayTopic={true} />)}
                </div>
            ) : null}
        </main>
    );
}