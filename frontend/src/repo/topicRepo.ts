
import { TopicRepository } from "./repository";

const NewTopicRepository = (host: string): TopicRepository => {
    return {
        getTopics: async (filter) => {
            return fetch(host + "/topics?sort_by=" + filter?.sortType, {
                method: "GET"
            }).then(res => res.json());
        },
        getTopicByID: async (id) => {
            return fetch(host + "/topics/" + id, {
                method: "GET"
            }).then(res => res.json());
        },
        getTopicsByUser: async (userId) => {
            return fetch(host + "/users/" + userId + "/topics", {
                method: "GET"
            }).then(res => res.json());
        },
        createTopic: async (text) => {
            const formData = new FormData();
            formData.append("text", text);

            // get auth token from cookies
            let token = document.cookie.split("; ").find(row => row.startsWith("authtoken"));
            if (!token) {
                throw new Error("No token found");
            }
            token = token.split("=")[1];

            return fetch(host + "/topics", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                },
                body: formData
            }).then(res => res.json());
        }
    }
}

export default NewTopicRepository;