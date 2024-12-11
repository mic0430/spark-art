"use client"

import { ArtCard } from "@/lib/components/client"
import { Artwork } from "@/lib/models"
import { ArtRepo } from "@/repo"
import { useEffect, useState } from "react"

export default function Dashboard() {
    const [sortType, setSortType] = useState('latest');
    const [artworks, setArtworks] = useState<Artwork[]>([]);

    useEffect(() => {
        ArtRepo.getArtworks().then(artworks => setArtworks(artworks)).catch(err => console.error(err));
    }, []);

    const onSortTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortType(e.target.value);

        if (e.target.value === 'latest') {
            ArtRepo.getArtworks("latest").then(artworks => setArtworks(artworks)).catch(err => console.error(err));
        } else if (e.target.value === 'most-liked') {
            ArtRepo.getArtworks("most-liked").then(artworks => setArtworks(artworks)).catch(err => console.error(err));
        }
    };

    return (
        <main>
            <h1 className="text-center text-4xl pt-8 font-semibold text-indigo-500">Explore Art</h1>
            <div className="flex w-full justify-center pt-4">
                <div className="text-center border-b-2 w-3/4">
                    <label htmlFor="" className="font-bold text-gray-800">
                        Sort By:
                    </label>
                    <select className="p-2 text-indigo-500 font-semibold"
                        value={sortType}
                        onChange={onSortTypeChange}>
                        <option value="latest">Latest</option>
                        <option value="most-liked">Most Liked</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <div className="grid grid-cols-4 w-3/4 mx-2 gap-4">
                    {artworks.map(artwork => <ArtCard key={artwork.id} artwork={artwork} displayAuthor={true} displayTopic={true} />)}
                </div>
            </div>
        </main>
    );
}