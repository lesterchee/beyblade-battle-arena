import { NextResponse } from 'next/server';

const MOCK_ARTICLES = [
    {
        id: "1",
        title: "New Baby Panda Born at National Zoo!",
        url: "https://nationalzoo.si.edu/",
        source: "Zoo News",
        publishedAt: "2023-10-27",
        parentSummary: "A healthy giant panda cub was born overnight. Keepers say both mom and baby are doing well and bonding in their den.",
        kidSummaryEn: "A tiny baby panda was born! It is pink and very small, like a stick of butter. Results say the mommy panda loves it very much.",
        kidSummaryZh: "一只小熊猫出生了！它是粉红色的，非常小。熊猫妈妈非常爱它，一直抱着它睡觉。"
    },
    {
        id: "2",
        title: "Astronauts Grow Flowers in Space",
        url: "https://nasa.gov",
        source: "Space Daily",
        publishedAt: "2023-10-25",
        parentSummary: "NASA astronauts have successfully cultivated zinnias aboard the ISS, marking a milestone in space agriculture.",
        kidSummaryEn: "Did you know flowers can grow in space? Astronauts grew beautiful orange flowers on their spaceship. They don't need rain, just special water!",
        kidSummaryZh: "你知道花儿可以在太空中生长吗？宇航员在飞船上种出了漂亮的橙色花朵。它们不需要下雨，只需要特别的水！"
    },
    {
        id: "3",
        title: "Dolphins Have Names for Each Other",
        url: "https://ocean.org",
        source: "Ocean Life",
        publishedAt: "2023-10-20",
        parentSummary: "Research confirms dolphins use unique whistles to identify and call out to specific individuals in their pod, similar to human names.",
        kidSummaryEn: "Dolphins are so smart! They have special whistles that act like names. When they want to talk to a friend, they call their name!",
        kidSummaryZh: "海豚非常聪明！它们有像名字一样的特殊哨声。当它们想和朋友说话时，就会呼唤朋友的名字！"
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const interests = searchParams.get('interests');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, we would use the 'interests' param to fetch specific news
    console.log(`Fetching news for interests: ${interests}`);

    return NextResponse.json({ articles: MOCK_ARTICLES });
}
