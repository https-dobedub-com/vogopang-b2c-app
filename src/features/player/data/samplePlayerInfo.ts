import type { PlayerContent, PlayerEpisode, PlayerInfoApiResponse } from '../types/playerInfo';

const sampleEpisodes: PlayerEpisode[] = [
  {
    id: 781,
    title: '1화',
    chapter: '1',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/61eee80c-9888-4b76-a023-73e0006b3075.webp',
    isRecording: true,
  },
  {
    id: 779,
    title: '2화',
    chapter: '2',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/44c93da2-8db0-4124-b076-1c538555d60f.webp',
    isRecording: false,
  },
  {
    id: 777,
    title: '3화',
    chapter: '3',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/bbd0b680-7c53-4e3a-b64e-9a510ab6b899.webp',
    isRecording: true,
  },
  {
    id: 773,
    title: '4화',
    chapter: '4',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/621456ce-9d01-48ff-86e8-b285f1fd9035.webp',
    isRecording: false,
  },
  {
    id: 767,
    title: '5화',
    chapter: '5',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/9eda4fbc-1b4e-4261-a53d-c3e719910673.webp',
    isRecording: false,
  },
  {
    id: 761,
    title: '6화',
    chapter: '6',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/21874252-d655-43c3-926a-ca922c122c49.webp',
    isRecording: false,
  },
  {
    id: 754,
    title: '7화',
    chapter: '7',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/c82c0d44-7430-4cfb-8191-0002a7926363.webp',
    isRecording: false,
  },
  {
    id: 747,
    title: '8화',
    chapter: '8',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/df9870a5-eb67-4174-896b-8c41396f0222.webp',
    isRecording: false,
  },
  {
    id: 738,
    title: '9화',
    chapter: '9',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/89bf33a6-451c-4643-846f-de6808f032a0.webp',
    isRecording: false,
  },
  {
    id: 730,
    title: '10화',
    chapter: '10',
    thumbnail: 'https://vogopang-prod.s3.ap-northeast-2.amazonaws.com/episodes/4b4b2f31-dbe9-4e8f-95b6-2e18920809bb.webp',
    isRecording: false,
  },
];

const sampleContent: PlayerContent = {
  format_version: 'dubright-content-1.1',
  images: [
    {
      uuid: 'c68f508f-b8dc-4ed3-9d92-2865cdef87a5',
      realname: '001.jpg',
      order: 0,
      src: 'images/c68f508f-b8dc-4ed3-9d92-2865cdef87a5.jpg',
      rawSrc: '/episode/2025-03/c68f508f-b8dc-4ed3-9d92-2865cdef87a5.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/c68f508f-b8dc-4ed3-9d92-2865cdef87a5.jpg',
    },
    {
      uuid: '0f938dee-4815-42dd-9511-52433c04c71c',
      realname: '1 white gap middle.jpg',
      order: 10,
      src: 'images/0f938dee-4815-42dd-9511-52433c04c71c.jpg',
      rawSrc: '/episode/2025-03/0f938dee-4815-42dd-9511-52433c04c71c.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/0f938dee-4815-42dd-9511-52433c04c71c.jpg',
    },
    {
      uuid: 'd5f7a4c7-28c6-4d6f-b5b1-19323ad5fc12',
      realname: '002.jpg',
      order: 20,
      src: 'images/d5f7a4c7-28c6-4d6f-b5b1-19323ad5fc12.jpg',
      rawSrc: '/episode/2025-03/d5f7a4c7-28c6-4d6f-b5b1-19323ad5fc12.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/d5f7a4c7-28c6-4d6f-b5b1-19323ad5fc12.jpg',
    },
    {
      uuid: 'f4ef9158-749c-427b-bd65-4af2aadf2744',
      realname: '1 white gap short.jpg',
      order: 30,
      src: 'images/f4ef9158-749c-427b-bd65-4af2aadf2744.jpg',
      rawSrc: '/episode/2025-03/f4ef9158-749c-427b-bd65-4af2aadf2744.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/f4ef9158-749c-427b-bd65-4af2aadf2744.jpg',
    },
    {
      uuid: '5f5cbfba-9a48-42f7-8583-8027d681b12c',
      realname: '003.jpg',
      order: 40,
      src: 'images/5f5cbfba-9a48-42f7-8583-8027d681b12c.jpg',
      rawSrc: '/episode/2025-03/5f5cbfba-9a48-42f7-8583-8027d681b12c.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/5f5cbfba-9a48-42f7-8583-8027d681b12c.jpg',
    },
    {
      uuid: 'cf26b305-922c-4bb1-ad52-4b334d248a9a',
      realname: '1 white gap short.jpg',
      order: 50,
      src: 'images/cf26b305-922c-4bb1-ad52-4b334d248a9a.jpg',
      rawSrc: '/episode/2025-03/cf26b305-922c-4bb1-ad52-4b334d248a9a.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/cf26b305-922c-4bb1-ad52-4b334d248a9a.jpg',
    },
    {
      uuid: '0bff9545-bcfb-4dba-8c35-441892ad7552',
      realname: '004.jpg',
      order: 60,
      src: 'images/0bff9545-bcfb-4dba-8c35-441892ad7552.jpg',
      rawSrc: '/episode/2025-03/0bff9545-bcfb-4dba-8c35-441892ad7552.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/0bff9545-bcfb-4dba-8c35-441892ad7552.jpg',
    },
    {
      uuid: '3241b563-32a6-4088-ada7-a01f7269e4ff',
      realname: '1 white gap short.jpg',
      order: 70,
      src: 'images/3241b563-32a6-4088-ada7-a01f7269e4ff.jpg',
      rawSrc: '/episode/2025-03/3241b563-32a6-4088-ada7-a01f7269e4ff.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/3241b563-32a6-4088-ada7-a01f7269e4ff.jpg',
    },
    {
      uuid: 'd6192985-2193-452a-98a2-9e625148bff7',
      realname: '005.jpg',
      order: 80,
      src: 'images/d6192985-2193-452a-98a2-9e625148bff7.jpg',
      rawSrc: '/episode/2025-03/d6192985-2193-452a-98a2-9e625148bff7.jpg',
      url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/images/d6192985-2193-452a-98a2-9e625148bff7.jpg',
    },
  ],
  spoints: [
    {
      uuid: 'eb55b857-03dc-44db-bc86-1994bcb43789',
      top: 724.1666666666667,
      time_ms: 4010,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: '658646dc-15fc-4500-a693-221163aea0b3',
      top: 1798.5,
      time_ms: 4370,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: '1db065d1-9411-4360-9e67-15602598e701',
      top: 1855.5,
      time_ms: 7890,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: '9c1be434-ba48-4fe0-9a9a-fcce93d40a28',
      top: 2852.666666666667,
      time_ms: 7990,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: 'bdf6dbb6-2348-4963-a663-7b3cf26293ab',
      top: 2881.5,
      time_ms: 9790,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: 'b87dd189-50c9-4d68-9e3c-693475c23bac',
      top: 3753,
      time_ms: 9890,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: 'c5c2ae12-5811-427e-af97-b7257f248de1',
      top: 3819,
      time_ms: 18200,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
    {
      uuid: 'a5f2a597-a852-4f65-bf3a-1fb6968278e6',
      top: 4517.666666666667,
      time_ms: 18390,
      transition_effect: { before_ms: 0, after_ms: 0 },
    },
  ],
  tracks: [
    {
      character_uuid: '44994100-1ae3-4300-932d-d4329f43aff2',
      character_name: 'Narrator',
      holes: [
        {
          uuid: 'ac49e27e-9fc2-4560-bc4d-c04b7654ff83',
          script_uuid: 'c54fa3f9-4320-43a7-97ac-2eab9374b3ee',
          start_ms: 270,
          duration_ms: 3744,
          script: '(타이틀) 육십오, 건설의 새로운 역사를 쓰다',
          index: 0,
          records: [
            {
              src: 'tracks/1286006f-2aa7-4b46-ad11-0ae4848c6967.mp3',
              artist_no: 42,
              rawSrc: '/2025-04/1286006f-2aa7-4b46-ad11-0ae4848c6967.webm',
              url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/tracks/1286006f-2aa7-4b46-ad11-0ae4848c6967.mp3',
            },
          ],
        },
      ],
    },
    {
      character_uuid: 'f07bfa20-4916-4445-9b87-01eefa386011',
      character_name: '우주',
      holes: [
        {
          uuid: '60dd8ecc-e080-4b16-8ee4-cb6f6e63976f',
          script_uuid: 'f78ccf19-6ef0-4232-b70c-832790ecdc90',
          start_ms: 4744,
          duration_ms: 3264,
          script: '어, 여기 새로 건물을 짓고 있네?',
          index: 1,
          records: [
            {
              src: 'tracks/cbbb672a-2148-4ca6-a9ab-1a73f872eb65.mp3',
              artist_no: 90,
              rawSrc: '/2025-04/cbbb672a-2148-4ca6-a9ab-1a73f872eb65.webm',
              url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/tracks/cbbb672a-2148-4ca6-a9ab-1a73f872eb65.mp3',
            },
          ],
        },
        {
          uuid: 'c1376692-416b-4941-89d4-8d584cb0e361',
          script_uuid: 'a48a687c-55ed-4585-bf09-beea67308509',
          start_ms: 16496,
          duration_ms: 1824,
          script: '콘크리트?',
          index: 4,
          records: [
            {
              src: 'tracks/e5aedb5f-42a7-42f6-a608-e1ddf5a865d3.mp3',
              artist_no: 90,
              rawSrc: '/2025-04/e5aedb5f-42a7-42f6-a608-e1ddf5a865d3.webm',
              url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/tracks/e5aedb5f-42a7-42f6-a608-e1ddf5a865d3.mp3',
            },
          ],
        },
      ],
    },
    {
      character_uuid: '2a4e571f-7c4f-4ebe-9c04-10614b715fb5',
      character_name: '해설',
      holes: [
        {
          uuid: '23eeab6c-f72a-4f3e-810d-8204df118bbe',
          script_uuid: '5e358e95-ab53-4d8b-b7ca-605a54918fe0',
          start_ms: 9768,
          duration_ms: 7008,
          script: '저건 레미콘 트럭이라고 해. 콘크리트를 바로 사용할 수 있도록 반죽을 해 주는 차량이란다.',
          index: 3,
          records: [
            {
              src: 'tracks/b9c317f1-c611-4ce7-88dd-4b7d8e90299b.mp3',
              artist_no: 33,
              rawSrc: '/2025-04/b9c317f1-c611-4ce7-88dd-4b7d8e90299b.webm',
              url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/tracks/b9c317f1-c611-4ce7-88dd-4b7d8e90299b.mp3',
            },
          ],
        },
      ],
    },
  ],
  audio_tracks: [
    {
      uuid: '9ff31f3c-f379-46e6-aa3d-07d7292ac7c1',
      name: '오디오 트랙 1',
      clips: [
        {
          uuid: 'b64e2a94-a779-47ac-bb80-ad09c27fc40c',
          start_ms: 0,
          duration_ms: 374825.3333333333,
          filename: 'sample-background.m4a',
          volume: 1,
          src: 'audio_tracks/b64e2a94-a779-47ac-bb80-ad09c27fc40c.m4a',
          rawSrc: '2025-04/b64e2a94-a779-47ac-bb80-ad09c27fc40c.m4a',
          url: 'https://vogopang-contents-prod.s3.ap-northeast-2.amazonaws.com/voicetoon/784/audio_tracks/b64e2a94-a779-47ac-bb80-ad09c27fc40c.m4a',
        },
      ],
    },
  ],
  replace_images: [],
};

export function createSamplePlayerInfoResponse(seriesId: number, episodeId: number): PlayerInfoApiResponse {
  const currentEpisode = sampleEpisodes.find((episode) => episode.id === episodeId) ?? sampleEpisodes[2];

  return {
    result: {
      code: 200,
      msg: 'success',
      data: {
        type: 'success',
        episode: {
          id: currentEpisode.id,
          title: currentEpisode.title,
          chapter: currentEpisode.chapter,
          seriesId,
          seriesName: '만화로 쉽게 읽는 과학사 100 시즌4 - 획기적인 보존 방법의 등장',
          thumbnailImageUrl: currentEpisode.thumbnail,
          viewCount: 25,
          version: 'V1',
        },
        content: JSON.stringify(sampleContent),
        directions: [],
        episodes: sampleEpisodes,
        message: '플레이어 정보 조회 성공',
      },
    },
  };
}
