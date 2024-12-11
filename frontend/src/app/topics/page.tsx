"use client";

import { PlusIcon, SearchIcon } from "@/lib/icons";
import { Topic } from "@/lib/models";
import { TopicRepo } from "@/repo";
import { useEffect, useState } from "react";

export default function Topics() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [search, setSearch] = useState("");
    const [sortType, setSortType] = useState('latest');

    useEffect(() => {
        console.log("TODO: fetch topics from the server");
        TopicRepo.getTopics().then(topics => setTopics(topics)).catch(err => console.error(err));
    }, []);

    const onSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortType(e.target.value);

        console.log("TODO: update topics based on sort type");

        if (e.target.value === 'latest') {
            TopicRepo.getTopics({sortType: 'latest'}).then(topics => setTopics(topics)).catch(err => console.error(err));
        } else if (e.target.value === 'most-responses') {
            TopicRepo.getTopics({sortType: 'most-responses'}).then(topics => setTopics(topics)).catch(err => console.error(err));
        }
    };

    const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log("TODO: search for topics based on search input");

        console.log(e.timeStamp)

        if (!search) return;

        TopicRepo.getTopics({
            search: search
        }).then(topics => {
            setTopics(topics);
        }).catch(err => console.error(err));
    };

    const handleCreate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const submitButton = e.target as HTMLButtonElement;
        submitButton.disabled = true;

        if (!search) {
            submitButton.disabled = false;
            return;
        }

        TopicRepo.createTopic(search).then(topic => {
            setTopics([topic, ...topics]);
            setSearch("");
        }).catch(err => {
            console.error(err);
        }).finally(() => {
            submitButton.disabled = false;
        });
    };

    return (
        <main>
            <h1 className="text-center text-4xl pt-8 font-semibold text-indigo-500">Explore Topics</h1>
            <div className="flex w-full justify-center pt-4">
                <div className="text-center border-b-2 w-3/4">
                    <div className="flex justify-center items-center">
                        <label htmlFor="search" className="font-semibold text-gray-800 bg-indigo-600 rounded-l-lg py-2.5 px-3 text-white">
                            Search
                        </label>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" className="border-2 border-indigo-500 p-2 w-1/2" name="search" placeholder="Spiderman Art" />
                        <button type="button" onClick={handleSearch} className="py-3 px-3 bg-indigo-600 hover:bg-indigo-500 transition ease-in-out duration-150 text-white rounded-r-lg">
                            <SearchIcon width={20} height={20} color="#ffffff" />
                        </button>
                        <button type="button" onClick={handleCreate} className="py-3 px-3 ml-1 bg-green-600 hover:bg-green-500 transition ease-in-out duration-150 text-white rounded-lg disabled:opacity-75">
                            <PlusIcon width={20} height={20} color="#ffffff" />
                        </button>
                    </div>
                    <div className="flex w-full justify-center pt-4">
                        <div className="text-center">
                            <label htmlFor="" className="font-bold text-gray-800">
                                Sort By:
                            </label>
                            <select className="p-2 text-indigo-500 font-semibold"
                                value={sortType}
                                onChange={onSortTypeChange}>
                                <option value="latest">Latest</option>
                                <option value="most-responses">Most Responses</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <div className="w-3/4">
                    <div className="flex justify-between border-b-2 border-indigo-500 p-2 mb-2 space-x-4">
                        <div className="w-2/5 font-semibold text-gray-800">Topic</div>
                        <div className="w-1/5 font-semibold text-gray-800">Creator</div>
                        <div className="w-1/5 font-semibold text-gray-800">Responses</div>
                        <div className="w-1/5 font-semibold text-gray-800">Created</div>
                    </div>
                    {topics.map((topic, idx) => (
                        <a key={idx} href={"/topics/" + topic.id} className="flex justify-between p-2 shadow bg-gray-50 mb-4 hover:bg-gray-100 transition ease-in-out duration-150 space-x-4">
                            <span className="w-2/5">{topic.text}</span>
                            <span className="w-1/5">{topic.creatorName}</span>
                            <span className="w-1/5">{topic.responses}</span>
                            <span className="w-1/5">{new Date(topic.createdAt).toDateString()}</span>
                        </a>
                    ))}
                </div>
            </div>
        </main>
    );
}