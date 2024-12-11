type PlusProps = {
    width: number;
    height: number;
    color?: string;
}

export default function Plus({ width, height, color = "#000000" }: PlusProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke={color}>
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path fill={color} fillRule="evenodd" d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"></path>
            </g>
        </svg>
    );
};