import { ArtComment } from "@/lib/models";

type ArtCommentRepo = {
    newArtComment: () => ArtComment;
    getArtCommentsByArtwork: (artworkId: number) => Promise<ArtComment[]>;
    createArtComment: (artworkId: number, text: string) => Promise<ArtComment>;
}

const NewCommentRepository = (host: string): ArtCommentRepo => {
    const newArtComment = () => {
        return {
            id: 0,
            creatorId: 0,
            creatorName: '',
            creatorIconUrl: '',
            artworkId: 0,
            text: '',
            createdAt: new Date()
        };
    };

    const getArtCommentsByArtwork = async (artworkId: number) => {
        return fetch(host + "/artworks/" + artworkId + "/comments", {
            method: "GET"
        }).then(res => res.json());
    };

    const createArtComment = async (artworkId: number, text: string) => {
        let token = document.cookie.split("; ").find(row => row.startsWith("authtoken"));
        if (!token) {
            throw new Error("No token found");
        }
        token = token.split("=")[1];

        const formData = new FormData();
        formData.append("text", text);

        return fetch(host + "/artworks/" + artworkId + "/comments", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData
        }).then(res => res.json());
    };

    return {
        newArtComment,
        getArtCommentsByArtwork,
        createArtComment
    };
};

export default NewCommentRepository;