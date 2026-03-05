import { IAssetData, IDecoratedAsset } from "../../src/types/asset";
import { faker } from "@faker-js/faker";
import { assetDecorationMapper } from "../../src/assetPool";
export const getRandomAssetData = (amount = 5) => {
  const data: IAssetData[] = [];
  for (let i = 0; i < amount; i++) {
    data.push({
      id: faker.datatype.number(),
      description: faker.word.noun(),
      latitude: +faker.address.latitude(),
      longitude: +faker.address.longitude(),
      file: faker.internet.url(),
      volume: faker.datatype.number({
        min: 0,
        max: 1,
      }),
      submitted: faker.datatype.boolean(),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.past().toISOString(),
      weight: faker.datatype.number({
        min: 0,
        max: 100,
      }),
      start_time: faker.datatype.number(),
      end_time: faker.datatype.number(),
      media_type: "audio",
      audio_length_sec: faker.datatype.number(),
      tag_ids: [],
      session_id: faker.datatype.number(),
      language_id: 0,
      envelope_id: null,
    });
  }

  return data;
};

export function getRandomDecoratedAssetData(amount = 5) {
  return getRandomAssetData(amount).map(assetDecorationMapper([]));
}
