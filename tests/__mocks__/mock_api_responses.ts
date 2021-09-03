import { IDecoratedAsset, IAssetData } from "../../src/types/asset";

export const MOCK_USER_DATA = {
  id: 80,
  username: "14961803690000",
  token: "579190238cff46c819462156a1537119996c2a52",
  first_name: "",
  last_name: "",
  email: "",
  device_id: "00000000000000",
  client_type: "web",
};

export const MOCK_SESSION_DATA = {
  id: 91152,
  device_id: "00000000000000",
  starttime: "2021-08-18T02:56:26.343924",
  stoptime: null,
  client_type: "web",
  client_system:
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
  demo_stream_enabled: false,
  geo_listen_enabled: false,
  timezone: "0000",
  project_id: 10,
  language_id: 1,
};

export const MOCK_PROJECT_DATA = {
  id: 10,
  name: "Roundware",
  owner: "",
  latitude: 42.36069,
  longitude: -71.087473,
  pub_date: "2013-07-01T22:11:11",
  audio_format: "mp3",
  auto_submit: true,
  max_recording_length: 120,
  listen_questions_dynamic: false,
  speak_questions_dynamic: false,
  sharing_url: "http://roundware.org/s/s.html",
  out_of_range_url: "http://prod.roundware.com:8000/scapes1.mp3",
  recording_radius: 10,
  listen_enabled: true,
  geo_listen_enabled: true,
  speak_enabled: true,
  geo_speak_enabled: true,
  reset_tag_defaults_on_startup: true,
  timed_asset_priority: true,
  repeat_mode: "stop",
  files_url: "http://halseyburgund.com/dev/rw-base/webview/rw.zip",
  files_version: "6",
  audio_stream_bitrate: "128",
  ordering: "random",
  demo_stream_enabled: false,
  demo_stream_url: "http://prod.roundware.com:8000/scapes1.mp3",
  out_of_range_distance: 1000.0,
  demo_stream_message: null,
  legal_agreement:
    "I agree that any recording I make using the Roundware app can be used by Halsey Burgund for any related artistic, documentary or educational purpose.\r\n\r\nThanks and enjoy!",
  description:
    "A basic Roundware project designed to be an example. Check it out!",
  sharing_message: "Check out this awesome recording I made!",
  out_of_range_message:
    "The Roundware app has full location-based listening functionality only in specific activated regions. It appears that you are not in one of these regions, so you will hear a demo audio stream.\r\n\r\nYou can still make recordings and otherwise explore the app. Thanks and enjoy!",
  language_ids: [1],
};

export const MOCK_PROJECT_UICONFIG_DATA = {
  listen: [
    {
      select: "min_one",
      group_short_name: "Question",
      header_display_text: "What do you want to hear?",
      display_items: [
        {
          id: 183,
          tag_id: 91,
          parent_id: null,
          default_state: true,
          tag_display_text:
            "Describe the building from where you’re standing. What details do you notice?",
        },
        {
          id: 184,
          tag_id: 92,
          parent_id: null,
          default_state: true,
          tag_display_text:
            "Tell a short story about the history of where you are standing.",
        },
        {
          id: 419,
          tag_id: 218,
          parent_id: null,
          default_state: true,
          tag_display_text: "Record ambient sounds that the building “hears.”",
        },
        {
          id: 544,
          tag_id: 281,
          parent_id: null,
          default_state: true,
          tag_display_text:
            "Imagine a blind person standing next to you. Share what you see.",
        },
        {
          id: 545,
          tag_id: 282,
          parent_id: null,
          default_state: true,
          tag_display_text: "What do blind people have to tell you.",
        },
      ],
    },
    {
      select: "single",
      group_short_name: "Playlist",
      header_display_text: "Choose a Playlist",
      display_items: [
        {
          id: 572,
          tag_id: 302,
          parent_id: null,
          default_state: false,
          tag_display_text: "Some Favorites",
        },
        {
          id: 573,
          tag_id: 303,
          parent_id: null,
          default_state: false,
          tag_display_text: "Weird Stuff",
        },
        {
          id: 759,
          tag_id: 353,
          parent_id: null,
          default_state: false,
          tag_display_text: "Recent Recordings",
        },
      ],
    },
  ],
  speak: [
    {
      select: "single",
      group_short_name: "Question",
      header_display_text: "What do you want to speak about?",
      display_items: [
        {
          id: 181,
          tag_id: 91,
          parent_id: null,
          default_state: false,
          tag_display_text:
            "Describe the building from where you’re standing. What details do you notice?",
        },
        {
          id: 182,
          tag_id: 92,
          parent_id: null,
          default_state: false,
          tag_display_text:
            "Tell a short story about the history of where you are standing.",
        },
        {
          id: 418,
          tag_id: 218,
          parent_id: null,
          default_state: false,
          tag_display_text: "Record ambient sounds that the building “hears.”",
        },
        {
          id: 542,
          tag_id: 281,
          parent_id: null,
          default_state: false,
          tag_display_text:
            "Imagine a blind person standing next to you. Share what you see.",
        },
      ],
    },
  ],
};

export const MOCK_SPEAKER_DATA = [
  {
    id: 178,
    activeyn: true,
    code: "GLAM-2",
    maxvolume: 1.0,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/speakers/glam-haptic.mp3",
    backupuri: "",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [113.94783155326878, 22.291809486686546],
            [113.94841614517647, 22.290156097342116],
            [113.9504122996732, 22.290892228753993],
            [113.94939309102485, 22.292327433315517],
            [113.94783155326878, 22.291809486686546],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [113.94783155326878, 22.291809486686546],
          [113.94841614517647, 22.290156097342116],
          [113.9504122996732, 22.290892228753993],
          [113.94939309102485, 22.292327433315517],
          [113.94783155326878, 22.291809486686546],
        ],
      ],
    },
    attenuation_distance: 50,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [113.94843997586557, 22.291532295847674],
        [113.9491980418709, 22.291783738771638],
        [113.94967862691345, 22.29110700408954],
        [113.94871587600805, 22.290751965745947],
        [113.94843997586557, 22.291532295847674],
      ],
    },
    project_id: 10,
  },
  {
    id: 179,
    activeyn: true,
    code: "GLAM-3",
    maxvolume: 1.0,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/speakers/glam-sorrow.mp3",
    backupuri: "",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [113.94622967040053, 22.29158362017197],
            [113.9462994222413, 22.28981517775678],
            [113.94894601668058, 22.29027599831951],
            [113.94837321509841, 22.291925734814466],
            [113.94622967040053, 22.29158362017197],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [113.94622967040053, 22.29158362017197],
          [113.9462994222413, 22.28981517775678],
          [113.94894601668058, 22.29027599831951],
          [113.94837321509841, 22.291925734814466],
          [113.94622967040053, 22.29158362017197],
        ],
      ],
    },
    attenuation_distance: 50,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [113.9467297479059, 22.291205650472],
        [113.94804104470873, 22.291414936881857],
        [113.94831525008995, 22.290625201204524],
        [113.94676329759251, 22.290354978445453],
        [113.9467297479059, 22.291205650472],
      ],
    },
    project_id: 10,
  },
  {
    id: 177,
    activeyn: true,
    code: "GLAM-1",
    maxvolume: 1.0,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/speakers/glam-fog.mp3",
    backupuri: "",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [113.94894340846805, 22.292086161392213],
            [113.94994719245007, 22.290673548563664],
            [113.95174680801576, 22.291695672349448],
            [113.95042490330525, 22.292801707001473],
            [113.94894340846805, 22.292086161392213],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [113.94894340846805, 22.292086161392213],
          [113.94994719245007, 22.290673548563664],
          [113.95174680801576, 22.291695672349448],
          [113.95042490330525, 22.292801707001473],
          [113.94894340846805, 22.292086161392213],
        ],
      ],
    },
    attenuation_distance: 50,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [113.94964507981649, 22.291916716376985],
        [113.95035033768583, 22.292257347515914],
        [113.95093854285957, 22.291765199839908],
        [113.9500937102474, 22.291285361196298],
        [113.94964507981649, 22.291916716376985],
      ],
    },
    project_id: 10,
  },
  {
    id: 156,
    activeyn: true,
    code: "AUS",
    maxvolume: 0.51,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    backupuri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [110.38238525390626, -10.331132026093936],
            [150.33691406250003, -8.750722808670284],
            [178.55255126953125, -29.146164433198397],
            [179.3449401855469, -45.37723168138016],
            [161.49902343750003, -52.42922227795513],
            [122.86285400390626, -47.98624517426206],
            [103.52691650390626, -30.15462722077597],
            [110.38238525390626, -10.331132026093936],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [110.38238525390626, -10.331132026093936],
          [150.33691406250003, -8.750722808670284],
          [178.55255126953125, -29.146164433198397],
          [179.3449401855469, -45.37723168138016],
          [161.49902343750003, -52.42922227795513],
          [122.86285400390626, -47.98624517426206],
          [103.52691650390626, -30.15462722077597],
          [110.38238525390626, -10.331132026093936],
        ],
      ],
    },
    attenuation_distance: 15,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [110.38248445970761, -10.331261644729405],
        [150.3368708366401, -8.750858684323475],
        [178.55241907606808, -29.14622460197399],
        [179.3448024534841, -45.37717921292673],
        [161.49899741877172, -52.42913574407457],
        [122.86292592625925, -47.986161930905],
        [103.52706767563059, -30.15460171891549],
        [110.38248445970761, -10.331261644729405],
      ],
    },
    project_id: 10,
  },
  {
    id: 113,
    activeyn: true,
    code: "HUUGHE",
    maxvolume: 0.3,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    backupuri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [3.101577758789062, 50.97507526314938],
            [3.087844848632813, 50.93138716634996],
            [3.11737060546875, 50.917103935557826],
            [3.218307495117188, 50.91017715419199],
            [3.218994140625, 50.94177221635303],
            [3.211441040039063, 50.9789662691611],
            [3.1475830078125, 50.99150173737569],
            [3.101577758789062, 50.97507526314938],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [3.101577758789062, 50.97507526314938],
          [3.087844848632813, 50.93138716634996],
          [3.11737060546875, 50.917103935557826],
          [3.218307495117188, 50.91017715419199],
          [3.218994140625, 50.94177221635303],
          [3.211441040039063, 50.9789662691611],
          [3.1475830078125, 50.99150173737569],
          [3.101577758789062, 50.97507526314938],
        ],
      ],
    },
    attenuation_distance: 25,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [3.101895219308392, 50.97493038424598],
        [3.147624329434713, 50.991258237428546],
        [3.211116906423507, 50.97879453741927],
        [3.218637995050453, 50.9417594030588],
        [3.217957303829857, 50.91042749316471],
        [3.117507754995019, 50.91732070381338],
        [3.088236908670926, 50.93148067818747],
        [3.101895219308392, 50.97493038424598],
      ],
    },
    project_id: 10,
  },
  {
    id: 138,
    activeyn: true,
    code: "NULL",
    maxvolume: 0.51,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    backupuri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-32.34375, -24.5271348225978],
            [-32.34375, 21.94304553343818],
            [21.09375, 21.94304553343818],
            [21.09375, -24.5271348225978],
            [-32.34375, -24.5271348225978],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [-32.34375, -24.5271348225978],
          [-32.34375, 21.94304553343818],
          [21.09375, 21.94304553343818],
          [21.09375, -24.5271348225978],
          [-32.34375, -24.5271348225978],
        ],
      ],
    },
    attenuation_distance: 1000,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [-32.334766847158804, -24.51891640742141],
        [-32.334766847158804, 21.934664594048893],
        [21.084766847158804, 21.934664594048893],
        [21.084766847158804, -24.51891640742141],
        [-32.334766847158804, -24.51891640742141],
      ],
    },
    project_id: 10,
  },
  {
    id: 137,
    activeyn: true,
    code: "USA",
    maxvolume: 0.51,
    minvolume: 0.0,
    uri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    backupuri: "http://prod.roundware.com/rwmedia/lm-glass.mp3",
    shape: {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-165.75347900390625, 5.501171835635249],
            [-165.75347900390625, 74.05579887521661],
            [-30.871582031250004, 74.05579887521661],
            [-30.871582031250004, 5.501171835635249],
            [-165.75347900390625, 5.501171835635249],
          ],
        ],
      ],
    },
    boundary: {
      type: "MultiLineString",
      coordinates: [
        [
          [-165.75347900390625, 5.501171835635249],
          [-165.75347900390625, 74.05579887521661],
          [-30.871582031250004, 74.05579887521661],
          [-30.871582031250004, 5.501171835635249],
          [-165.75347900390625, 5.501171835635249],
        ],
      ],
    },
    attenuation_distance: 1000,
    attenuation_border: {
      type: "LineString",
      coordinates: [
        [-165.74449585106504, 5.510173254421574],
        [-165.74449585106504, 74.05332975207756],
        [-30.8805651840912, 74.05332975207756],
        [-30.8805651840912, 5.510173254421574],
        [-165.74449585106504, 5.510173254421574],
      ],
    },
    project_id: 10,
  },
];

export const MOCK_AUDIO_TRACKS_DATA = [
  {
    id: 12,
    minvolume: 1.0,
    maxvolume: 1.0,
    minduration: 30.0,
    maxduration: 60.0,
    mindeadair: 0.5,
    maxdeadair: 2.0,
    minfadeintime: 0.1,
    maxfadeintime: 1.0,
    minfadeouttime: 2.0,
    maxfadeouttime: 5.0,
    minpanpos: 0.0,
    maxpanpos: 0.0,
    minpanduration: 5.0,
    maxpanduration: 10.0,
    repeatrecordings: false,
    active: true,
    start_with_silence: false,
    banned_duration: 600,
    fadeout_when_filtered: true,
    timed_asset_priority: "discard",
    tag_filters: [],
    project_id: 10,
  },
];

export const MOCK_ASSET_DATA = [
  {
    id: 5934,
    description: "",
    latitude: 42.4986343383789,
    longitude: -71.2810440063477,
    shape: null,
    filename: "20150117-231643-18447.wav",
    file: "https://prod.roundware.com/rwmedia/20150117-231643-18447.mp3",
    volume: 1.0,
    submitted: true,
    created: "2015-01-17T23:16:44",
    updated: "2015-01-17T23:16:44",
    weight: 50,
    start_time: 0.0,
    end_time: 11.284,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 11.28,
    tag_ids: [91],
    session_id: 18447,
    project_id: 10,
    language_id: 1,
    envelope_ids: [3389],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },
  {
    id: 5935,
    description: "",
    latitude: 42.4987144470215,
    longitude: -71.2809524536133,
    shape: null,
    filename: "20150117-231843-18447.wav",
    file: "https://prod.roundware.com/rwmedia/20150117-231843-18447.mp3",
    volume: 1.0,
    submitted: true,
    created: "2015-01-17T23:18:44",
    updated: "2015-01-17T23:18:44",
    weight: 50,
    start_time: 0.0,
    end_time: 3.436,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 3.44,
    tag_ids: [92],
    session_id: 18447,
    project_id: 10,
    language_id: 1,
    envelope_ids: [3390],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },
  {
    id: 5936,
    description: "",
    latitude: 1.0,
    longitude: 1.0,
    shape: null,
    filename: "20150119-113758-18467.wav",
    file: "https://prod.roundware.com/rwmedia/20150119-113758-18467.mp3",
    volume: 1.0,
    submitted: true,
    created: "2015-01-19T11:37:59",
    updated: "2015-01-19T11:37:59",
    weight: 50,
    start_time: 0.0,
    end_time: 7.407,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 7.41,
    tag_ids: [92],
    session_id: 18467,
    project_id: 10,
    language_id: 1,
    envelope_ids: [3392],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },
];

export const MOCK_TIMED_ASSET_DATA = [
  { id: 854, start: 30.0, end: 120.0, asset_id: 13035, project_id: 10 },
];

export const MOCK_DECORATED_ASSET_DATA: IDecoratedAsset[] = [
  {
    locationPoint: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.9643249511719, 40.7683525085449],
      },
    },
    playCount: 0,
    activeRegionLength: 54.845,
    activeRegionUpperBound: 54.845,
    activeRegionLowerBound: 0,
    id: 9742,
    description: "",
    latitude: 40.7683525085449,
    longitude: -73.9643249511719,
    shape: null,
    filename: "20170318-114225-29942.wav",
    file: "//prod.roundware.com/rwmedia/20170318-114225-29942.mp3",
    volume: 1,
    submitted: true,
    created: "2017-03-18T06:12:26.768Z",
    updated: "2017-03-18T11:42:26.768881",
    weight: 50,
    start_time: 0,
    end_time: 54.845,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 54.84,
    tag_ids: [262],
    session_id: 29942,
    project_id: 10,
    language_id: 1,
    envelope_ids: [4830],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },

  {
    locationPoint: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.9641189575195, 40.7680473327637],
      },
    },
    playCount: 0,
    activeRegionLength: 8.266,
    activeRegionUpperBound: 8.266,
    activeRegionLowerBound: 0,
    id: 9743,
    description: "",
    latitude: 40.7680473327637,
    longitude: -73.9641189575195,
    shape: null,
    filename: "20170318-114536-29944.wav",
    file: "//prod.roundware.com/rwmedia/20170318-114536-29944.mp3",
    volume: 1,
    submitted: true,
    created: "2017-03-18T06:15:36.578Z",
    updated: "2017-03-18T11:45:36.578162",
    weight: 50,
    start_time: 0,
    end_time: 8.266,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 8.27,
    tag_ids: [263],
    session_id: 29944,
    project_id: 10,
    language_id: 1,
    envelope_ids: [4831],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },
  {
    locationPoint: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.9640655517578, 40.7687492370605],
      },
    },
    playCount: 0,
    activeRegionLength: 47.786,
    activeRegionUpperBound: 47.786,
    activeRegionLowerBound: 0,
    id: 9747,
    description: "",
    latitude: 40.7687492370605,
    longitude: -73.9640655517578,
    shape: null,
    filename: "20170318-114845-29944.wav",
    file: "//prod.roundware.com/rwmedia/20170318-114845-29944.mp3",
    volume: 1,
    submitted: true,
    created: "2017-03-18T06:18:46.085Z",
    updated: "2017-03-18T11:48:46.085651",
    weight: 50,
    start_time: 0,
    end_time: 47.786,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 47.79,
    tag_ids: [262],
    session_id: 29944,
    project_id: 10,
    language_id: 1,
    envelope_ids: [4834],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },

  {
    locationPoint: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.9637298583984, 40.7685813903809],
      },
    },
    playCount: 0,
    activeRegionLength: 21.269,
    activeRegionUpperBound: 21.269,
    activeRegionLowerBound: 0,
    id: 9746,
    description: "",
    latitude: 40.7685813903809,
    longitude: -73.9637298583984,
    shape: null,
    filename: "20170318-114714-29944.wav",
    file: "//prod.roundware.com/rwmedia/20170318-114714-29944.mp3",
    volume: 1,
    submitted: true,
    created: "2017-03-18T06:17:14.983Z",
    updated: "2017-03-18T11:47:14.983710",
    weight: 50,
    start_time: 0,
    end_time: 21.269,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 21.27,
    tag_ids: [262],
    session_id: 29944,
    project_id: 10,
    language_id: 1,
    envelope_ids: [4833],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },

  {
    locationPoint: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [-73.9650421142578, 40.7684745788574],
      },
    },
    playCount: 0,
    activeRegionLength: 15.325,
    activeRegionUpperBound: 15.325,
    activeRegionLowerBound: 0,
    id: 9740,
    description: "",
    latitude: 40.7684745788574,
    longitude: -73.9650421142578,
    shape: null,
    filename: "20170318-112934-29937.wav",
    file: "//prod.roundware.com/rwmedia/20170318-112934-29937.mp3",
    volume: 1,
    submitted: true,
    created: "2017-03-18T05:59:35.483Z",
    updated: "2017-03-18T11:29:35.483224",
    weight: 50,
    start_time: 0,
    end_time: 15.325,
    user: null,
    media_type: "audio",
    audio_length_in_seconds: 15.32,
    tag_ids: [262],
    session_id: 29937,
    project_id: 10,
    language_id: 1,
    envelope_ids: [4829],
    description_loc_ids: [],
    alt_text_loc_ids: [],
  },
];


export const MOCK_FULL_ASSETDATA: IAssetData[] = [
	{
		"id": 5934,
		"description": "",
		"latitude": 42.4986343383789,
		"longitude": -71.2810440063477,
		"shape": null,
		"filename": "20150117-231643-18447.wav",
		"file": "https://prod.roundware.com/rwmedia/20150117-231643-18447.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-01-17T23:16:44",
		"updated": "2015-01-17T23:16:44",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.284,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.28,
		"tag_ids": [
			91
		],
		"session_id": 18447,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3389
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 5935,
		"description": "",
		"latitude": 42.4987144470215,
		"longitude": -71.2809524536133,
		"shape": null,
		"filename": "20150117-231843-18447.wav",
		"file": "https://prod.roundware.com/rwmedia/20150117-231843-18447.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-01-17T23:18:44",
		"updated": "2015-01-17T23:18:44",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.436,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.44,
		"tag_ids": [
			92
		],
		"session_id": 18447,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3390
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 5936,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150119-113758-18467.wav",
		"file": "https://prod.roundware.com/rwmedia/20150119-113758-18467.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-01-19T11:37:59",
		"updated": "2015-01-19T11:37:59",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.407,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.41,
		"tag_ids": [
			92
		],
		"session_id": 18467,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3392
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 5948,
		"description": "",
		"latitude": 42.4988555908203,
		"longitude": -71.2810211181641,
		"shape": null,
		"filename": "20150129-123406-18578.wav",
		"file": "https://prod.roundware.com/rwmedia/20150129-123406-18578.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-01-29T12:34:06",
		"updated": "2015-01-29T12:34:06",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.122,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.12,
		"tag_ids": [
			91
		],
		"session_id": 18578,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3405
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 5953,
		"description": "",
		"latitude": 42.4986114501953,
		"longitude": -71.2810516357422,
		"shape": null,
		"filename": "20150202-225747-18629.wav",
		"file": "https://prod.roundware.com/rwmedia/20150202-225747-18629.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-02T22:57:48",
		"updated": "2015-02-02T22:57:48",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.233,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.23,
		"tag_ids": [
			91
		],
		"session_id": 18629,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3409
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6111,
		"description": "",
		"latitude": 25.7830410003662,
		"longitude": -80.1321487426758,
		"shape": null,
		"filename": "20150206-105614-18694.wav",
		"file": "https://prod.roundware.com/rwmedia/20150206-105614-18694.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-06T10:56:16",
		"updated": "2015-02-06T10:56:16",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.932,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 43.93,
		"tag_ids": [
			91
		],
		"session_id": 18694,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3462
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6112,
		"description": "",
		"latitude": 25.7825775146484,
		"longitude": -80.1324768066406,
		"shape": null,
		"filename": "20150206-105917-18694.wav",
		"file": "https://prod.roundware.com/rwmedia/20150206-105917-18694.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-06T10:59:17",
		"updated": "2015-02-06T10:59:17",
		"weight": 50,
		"start_time": 0,
		"end_time": 45.603,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 45.6,
		"tag_ids": [
			91
		],
		"session_id": 18694,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3463
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6141,
		"description": "",
		"latitude": 25.7828636169434,
		"longitude": -80.1316833496094,
		"shape": null,
		"filename": "20150207-100941-18728.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-100941-18728.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T10:09:42",
		"updated": "2015-02-07T10:09:42",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.579,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.58,
		"tag_ids": [
			91
		],
		"session_id": 18728,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3492
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6145,
		"description": "",
		"latitude": 25.7824001312256,
		"longitude": -80.1325912475586,
		"shape": null,
		"filename": "20150207-115749-18744.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-115749-18744.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T11:57:49",
		"updated": "2015-02-07T11:57:49",
		"weight": 50,
		"start_time": 0,
		"end_time": 36.083,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 36.08,
		"tag_ids": [
			218
		],
		"session_id": 18744,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3496
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6146,
		"description": "",
		"latitude": 25.7806892395019,
		"longitude": -80.1332550048828,
		"shape": null,
		"filename": "20150207-121258-18744.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-121258-18744.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:12:59",
		"updated": "2015-02-07T12:12:59",
		"weight": 50,
		"start_time": 0,
		"end_time": 44.698,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 44.7,
		"tag_ids": [
			91
		],
		"session_id": 18744,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3497
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6147,
		"description": "",
		"latitude": 25.7821483612061,
		"longitude": -80.1327209472656,
		"shape": null,
		"filename": "20150207-121928-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-121928-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:19:29",
		"updated": "2015-02-07T12:19:29",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.3,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.3,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3498
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6148,
		"description": "",
		"latitude": 25.7822189331055,
		"longitude": -80.1327667236328,
		"shape": null,
		"filename": "20150207-122051-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122051-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:20:52",
		"updated": "2015-02-07T12:20:52",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.874,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 35.87,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3499
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6149,
		"description": "",
		"latitude": 25.7819843292236,
		"longitude": -80.1327514648438,
		"shape": null,
		"filename": "20150207-122243-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122243-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:22:44",
		"updated": "2015-02-07T12:22:44",
		"weight": 50,
		"start_time": 0,
		"end_time": 52.987,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 52.99,
		"tag_ids": [
			92
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3500
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6150,
		"description": "",
		"latitude": 25.7823429107666,
		"longitude": -80.1328277587891,
		"shape": null,
		"filename": "20150207-122244-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122244-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:22:44",
		"updated": "2015-02-07T12:22:44",
		"weight": 50,
		"start_time": 0,
		"end_time": 46.068,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 46.07,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3501
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6151,
		"description": "",
		"latitude": 25.7827339172363,
		"longitude": -80.1327209472656,
		"shape": null,
		"filename": "20150207-122429-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122429-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:24:29",
		"updated": "2015-02-07T12:24:29",
		"weight": 50,
		"start_time": 0,
		"end_time": 39.102,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 39.1,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3502
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6152,
		"description": "",
		"latitude": 25.781213760376,
		"longitude": -80.1328201293945,
		"shape": null,
		"filename": "20150207-122502-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122502-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:25:03",
		"updated": "2015-02-07T12:25:03",
		"weight": 50,
		"start_time": 0,
		"end_time": 41.679,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 41.68,
		"tag_ids": [
			218
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3503
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6153,
		"description": "",
		"latitude": 25.7826061248779,
		"longitude": -80.1327362060547,
		"shape": null,
		"filename": "20150207-122531-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122531-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:25:32",
		"updated": "2015-02-07T12:25:32",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.12,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.12,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3504
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6154,
		"description": "",
		"latitude": 25.7828235626221,
		"longitude": -80.1328506469727,
		"shape": null,
		"filename": "20150207-122641-18754.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122641-18754.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:26:42",
		"updated": "2015-02-07T12:26:42",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.568,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.57,
		"tag_ids": [
			91
		],
		"session_id": 18754,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3505
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6155,
		"description": "",
		"latitude": 25.7814636230469,
		"longitude": -80.1325759887695,
		"shape": null,
		"filename": "20150207-122707-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122707-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:27:08",
		"updated": "2015-02-07T12:27:08",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.98,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.98,
		"tag_ids": [
			218
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3506
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6156,
		"description": "",
		"latitude": 25.7829303741455,
		"longitude": -80.1336898803711,
		"shape": null,
		"filename": "20150207-122825-18756.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122825-18756.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:28:25",
		"updated": "2015-02-07T12:28:25",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.913,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.91,
		"tag_ids": [
			91
		],
		"session_id": 18756,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3507
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6157,
		"description": "",
		"latitude": 25.7825756072998,
		"longitude": -80.1341094970703,
		"shape": null,
		"filename": "20150207-122944-18757.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122944-18757.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:29:44",
		"updated": "2015-02-07T12:29:44",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.77,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.77,
		"tag_ids": [
			91
		],
		"session_id": 18757,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3508
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6158,
		"description": "",
		"latitude": 25.7817935943604,
		"longitude": -80.1324996948242,
		"shape": null,
		"filename": "20150207-122951-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-122951-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:29:52",
		"updated": "2015-02-07T12:29:52",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.738,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.74,
		"tag_ids": [
			92
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3509
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6159,
		"description": "",
		"latitude": 25.782283782959,
		"longitude": -80.133903503418,
		"shape": null,
		"filename": "20150207-123115-18757.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123115-18757.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:31:16",
		"updated": "2015-02-07T12:31:16",
		"weight": 50,
		"start_time": 0,
		"end_time": 46.695,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 46.7,
		"tag_ids": [
			92
		],
		"session_id": 18757,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3510
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6160,
		"description": "",
		"latitude": 25.782564163208,
		"longitude": -80.1325073242188,
		"shape": null,
		"filename": "20150207-123148-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123148-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:31:48",
		"updated": "2015-02-07T12:31:48",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.6,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.6,
		"tag_ids": [
			218
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3511
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6161,
		"description": "",
		"latitude": 25.7819385528564,
		"longitude": -80.1335220336914,
		"shape": null,
		"filename": "20150207-123419-18758.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123419-18758.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:34:20",
		"updated": "2015-02-07T12:34:20",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.11,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.11,
		"tag_ids": [
			91
		],
		"session_id": 18758,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3512
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6162,
		"description": "",
		"latitude": 25.7826175689697,
		"longitude": -80.1322860717773,
		"shape": null,
		"filename": "20150207-123527-18755.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123527-18755.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:35:28",
		"updated": "2015-02-07T12:35:28",
		"weight": 50,
		"start_time": 0,
		"end_time": 45.789,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 45.79,
		"tag_ids": [
			218
		],
		"session_id": 18755,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3513
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6163,
		"description": "",
		"latitude": 25.782075881958,
		"longitude": -80.1328887939453,
		"shape": null,
		"filename": "20150207-123543-18758.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123543-18758.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:35:43",
		"updated": "2015-02-07T12:35:43",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.63,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.63,
		"tag_ids": [
			218
		],
		"session_id": 18758,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3514
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6164,
		"description": "",
		"latitude": 25.7820701599121,
		"longitude": -80.1329116821289,
		"shape": null,
		"filename": "20150207-123653-18758.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123653-18758.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:36:54",
		"updated": "2015-02-07T12:36:54",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.03,
		"tag_ids": [
			92
		],
		"session_id": 18758,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3515
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6165,
		"description": "",
		"latitude": 25.7820510864258,
		"longitude": -80.1326217651367,
		"shape": null,
		"filename": "20150207-123749-18758.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-123749-18758.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T12:37:50",
		"updated": "2015-02-07T12:37:50",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.165,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.16,
		"tag_ids": [
			92
		],
		"session_id": 18758,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3516
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6166,
		"description": "",
		"latitude": 25.7820091247559,
		"longitude": -80.1324157714844,
		"shape": null,
		"filename": "20150207-134742-18765.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-134742-18765.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T13:47:43",
		"updated": "2015-02-07T13:47:43",
		"weight": 50,
		"start_time": 0,
		"end_time": 51.571,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 51.57,
		"tag_ids": [
			218
		],
		"session_id": 18765,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3517
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6168,
		"description": "",
		"latitude": 25.7819519042969,
		"longitude": -80.1324920654297,
		"shape": null,
		"filename": "20150207-140359-18768.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-140359-18768.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:04:00",
		"updated": "2015-02-07T14:04:00",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.134,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.13,
		"tag_ids": [
			218
		],
		"session_id": 18768,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3519
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6169,
		"description": "",
		"latitude": 25.7827873229981,
		"longitude": -80.1324844360352,
		"shape": null,
		"filename": "20150207-141459-18784.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141459-18784.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:15:01",
		"updated": "2015-02-07T14:15:01",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.859,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.86,
		"tag_ids": [
			91
		],
		"session_id": 18784,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3520
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6170,
		"description": "",
		"latitude": 25.7823085784912,
		"longitude": -80.1326370239258,
		"shape": null,
		"filename": "20150207-141504-18777.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141504-18777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:15:05",
		"updated": "2015-02-07T14:15:05",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.277,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.28,
		"tag_ids": [
			92
		],
		"session_id": 18777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3521
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6171,
		"description": "",
		"latitude": 25.7820587158203,
		"longitude": -80.1325836181641,
		"shape": null,
		"filename": "20150207-141647-18795.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141647-18795.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:16:48",
		"updated": "2015-02-07T14:16:48",
		"weight": 50,
		"start_time": 0,
		"end_time": 36.71,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 36.71,
		"tag_ids": [
			92
		],
		"session_id": 18795,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3523
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6172,
		"description": "",
		"latitude": 25.7829341888428,
		"longitude": -80.132453918457,
		"shape": null,
		"filename": "20150207-141705-18783.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141705-18783.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:17:05",
		"updated": "2015-02-07T14:17:05",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.181,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.18,
		"tag_ids": [
			218
		],
		"session_id": 18783,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3524
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6173,
		"description": "",
		"latitude": 25.7830371856689,
		"longitude": -80.1323318481445,
		"shape": null,
		"filename": "20150207-141915-18802.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141915-18802.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:19:16",
		"updated": "2015-02-07T14:19:16",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.919,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.92,
		"tag_ids": [
			92
		],
		"session_id": 18802,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3527
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6174,
		"description": "",
		"latitude": 25.7829818725586,
		"longitude": -80.1312637329102,
		"shape": null,
		"filename": "20150207-141941-18805.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141941-18805.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:19:42",
		"updated": "2015-02-07T14:19:42",
		"weight": 50,
		"start_time": 0,
		"end_time": 44.141,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 44.14,
		"tag_ids": [
			91
		],
		"session_id": 18805,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3528
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6175,
		"description": "",
		"latitude": 25.7821044921875,
		"longitude": -80.132568359375,
		"shape": null,
		"filename": "20150207-141950-18798.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-141950-18798.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:19:52",
		"updated": "2015-02-07T14:19:52",
		"weight": 50,
		"start_time": 0,
		"end_time": 53.521,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 53.52,
		"tag_ids": [
			92
		],
		"session_id": 18798,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3526
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6176,
		"description": "",
		"latitude": 25.7824211120606,
		"longitude": -80.1326599121094,
		"shape": null,
		"filename": "20150207-142111-18785.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142111-18785.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:21:12",
		"updated": "2015-02-07T14:21:12",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.274,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.27,
		"tag_ids": [
			218
		],
		"session_id": 18785,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3525
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6177,
		"description": "",
		"latitude": 25.7830181121826,
		"longitude": -80.1312484741211,
		"shape": null,
		"filename": "20150207-142119-18805.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142119-18805.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:21:20",
		"updated": "2015-02-07T14:21:20",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.599,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.6,
		"tag_ids": [
			91
		],
		"session_id": 18805,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3529
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6178,
		"description": "",
		"latitude": 25.7829170227051,
		"longitude": -80.132698059082,
		"shape": null,
		"filename": "20150207-142208-18811.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142208-18811.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:22:09",
		"updated": "2015-02-07T14:22:09",
		"weight": 50,
		"start_time": 0,
		"end_time": 52.593,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 52.59,
		"tag_ids": [
			91
		],
		"session_id": 18811,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3530
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6179,
		"description": "",
		"latitude": 25.7827281951904,
		"longitude": -80.1328506469727,
		"shape": null,
		"filename": "20150207-142303-18813.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142303-18813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:23:03",
		"updated": "2015-02-07T14:23:03",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.896,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.9,
		"tag_ids": [
			91
		],
		"session_id": 18813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3531
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6180,
		"description": "",
		"latitude": 25.7819232940674,
		"longitude": -80.1324768066406,
		"shape": null,
		"filename": "20150207-142312-18798.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142312-18798.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:23:13",
		"updated": "2015-02-07T14:23:13",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			91
		],
		"session_id": 18798,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3532
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6181,
		"description": "",
		"latitude": 25.7831268310547,
		"longitude": -80.1323165893555,
		"shape": null,
		"filename": "20150207-142327-18817.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142327-18817.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:23:28",
		"updated": "2015-02-07T14:23:28",
		"weight": 50,
		"start_time": 0,
		"end_time": 56.029,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 56.03,
		"tag_ids": [
			92
		],
		"session_id": 18817,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3533
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6182,
		"description": "",
		"latitude": 25.7825870513916,
		"longitude": -80.1338806152344,
		"shape": null,
		"filename": "20150207-142339-18819.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142339-18819.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:23:39",
		"updated": "2015-02-07T14:23:39",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.02,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.02,
		"tag_ids": [
			92
		],
		"session_id": 18819,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3534
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6183,
		"description": "",
		"latitude": 25.7829208374023,
		"longitude": -80.1312408447266,
		"shape": null,
		"filename": "20150207-142353-18805.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142353-18805.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:23:54",
		"updated": "2015-02-07T14:23:54",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			218
		],
		"session_id": 18805,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3535
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6184,
		"description": "",
		"latitude": 25.7795543670654,
		"longitude": -80.1340179443359,
		"shape": null,
		"filename": "20150207-142417-18777.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142417-18777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:24:19",
		"updated": "2015-02-07T14:24:19",
		"weight": 50,
		"start_time": 0,
		"end_time": 53.22,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 53.22,
		"tag_ids": [
			218
		],
		"session_id": 18777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3536
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6185,
		"description": "",
		"latitude": 25.7833557128906,
		"longitude": -80.1323776245117,
		"shape": null,
		"filename": "20150207-142458-18814.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142458-18814.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:24:58",
		"updated": "2015-02-07T14:24:58",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.524,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.52,
		"tag_ids": [
			91
		],
		"session_id": 18814,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3537
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6186,
		"description": "",
		"latitude": 25.7822742462158,
		"longitude": -80.1326141357422,
		"shape": null,
		"filename": "20150207-142529-18823.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142529-18823.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:25:29",
		"updated": "2015-02-07T14:25:29",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.086,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.09,
		"tag_ids": [
			218
		],
		"session_id": 18823,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3538
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6187,
		"description": "",
		"latitude": 25.7818355560303,
		"longitude": -80.1318359375,
		"shape": null,
		"filename": "20150207-142614-18795.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142614-18795.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:26:15",
		"updated": "2015-02-07T14:26:15",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.272,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.27,
		"tag_ids": [
			92
		],
		"session_id": 18795,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3539
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6188,
		"description": "",
		"latitude": 25.7830238342285,
		"longitude": -80.1312408447266,
		"shape": null,
		"filename": "20150207-142716-18805.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142716-18805.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:27:17",
		"updated": "2015-02-07T14:27:17",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			218
		],
		"session_id": 18805,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3540
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6189,
		"description": "",
		"latitude": 25.7826156616211,
		"longitude": -80.1326599121094,
		"shape": null,
		"filename": "20150207-142725-18814.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142725-18814.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:27:26",
		"updated": "2015-02-07T14:27:26",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.848,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.85,
		"tag_ids": [
			91
		],
		"session_id": 18814,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3541
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6190,
		"description": "",
		"latitude": 25.7820682525635,
		"longitude": -80.1328506469727,
		"shape": null,
		"filename": "20150207-142748-18823.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142748-18823.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:27:49",
		"updated": "2015-02-07T14:27:49",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.055,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.05,
		"tag_ids": [
			92
		],
		"session_id": 18823,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3542
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6191,
		"description": "",
		"latitude": 25.7826366424561,
		"longitude": -80.1325454711914,
		"shape": null,
		"filename": "20150207-142856-18819.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142856-18819.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:28:56",
		"updated": "2015-02-07T14:28:56",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.113,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.11,
		"tag_ids": [
			218
		],
		"session_id": 18819,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3543
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6192,
		"description": "",
		"latitude": 25.7817478179932,
		"longitude": -80.1311492919922,
		"shape": null,
		"filename": "20150207-142929-18828.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142929-18828.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:29:30",
		"updated": "2015-02-07T14:29:30",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			218
		],
		"session_id": 18828,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3545
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6193,
		"description": "",
		"latitude": 25.7822704315186,
		"longitude": -80.1327896118164,
		"shape": null,
		"filename": "20150207-142943-18829.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-142943-18829.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:29:45",
		"updated": "2015-02-07T14:29:45",
		"weight": 50,
		"start_time": 0,
		"end_time": 59.187,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 59.19,
		"tag_ids": [
			92
		],
		"session_id": 18829,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3544
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6194,
		"description": "",
		"latitude": 25.7829608917236,
		"longitude": -80.132080078125,
		"shape": null,
		"filename": "20150207-143024-18831.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143024-18831.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:30:25",
		"updated": "2015-02-07T14:30:25",
		"weight": 50,
		"start_time": 0,
		"end_time": 54.265,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 54.27,
		"tag_ids": [
			91
		],
		"session_id": 18831,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3546
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6195,
		"description": "",
		"latitude": 25.7821216583252,
		"longitude": -80.1326675415039,
		"shape": null,
		"filename": "20150207-143237-18832.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143237-18832.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:32:38",
		"updated": "2015-02-07T14:32:38",
		"weight": 50,
		"start_time": 0,
		"end_time": 57.144,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 57.14,
		"tag_ids": [
			92
		],
		"session_id": 18832,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3547
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6196,
		"description": "",
		"latitude": 25.7829837799072,
		"longitude": -80.1321792602539,
		"shape": null,
		"filename": "20150207-143244-18831.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143244-18831.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:32:45",
		"updated": "2015-02-07T14:32:45",
		"weight": 50,
		"start_time": 0,
		"end_time": 56.47,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 56.47,
		"tag_ids": [
			92
		],
		"session_id": 18831,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3548
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6197,
		"description": "",
		"latitude": 25.7823543548584,
		"longitude": -80.1329574584961,
		"shape": null,
		"filename": "20150207-143455-18823.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143455-18823.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:34:56",
		"updated": "2015-02-07T14:34:56",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.557,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.56,
		"tag_ids": [
			91
		],
		"session_id": 18823,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3549
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6198,
		"description": "",
		"latitude": 25.7823543548584,
		"longitude": -80.1329574584961,
		"shape": null,
		"filename": "20150207-143506-18823.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143506-18823.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:35:07",
		"updated": "2015-02-07T14:35:07",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.557,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.56,
		"tag_ids": [
			91
		],
		"session_id": 18823,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3549
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6199,
		"description": "",
		"latitude": 25.7823982238769,
		"longitude": -80.1330184936523,
		"shape": null,
		"filename": "20150207-143829-18835.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143829-18835.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:38:29",
		"updated": "2015-02-07T14:38:29",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.255,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.26,
		"tag_ids": [
			92
		],
		"session_id": 18835,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3550
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6200,
		"description": "",
		"latitude": 25.7827110290527,
		"longitude": -80.1328201293945,
		"shape": null,
		"filename": "20150207-143904-18835.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143904-18835.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:39:04",
		"updated": "2015-02-07T14:39:04",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.263,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.26,
		"tag_ids": [
			92
		],
		"session_id": 18835,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3551
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6201,
		"description": "",
		"latitude": 25.7826023101807,
		"longitude": -80.1327362060547,
		"shape": null,
		"filename": "20150207-143953-18835.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-143953-18835.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:39:53",
		"updated": "2015-02-07T14:39:53",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.009,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.01,
		"tag_ids": [
			218
		],
		"session_id": 18835,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3552
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6202,
		"description": "",
		"latitude": 25.7818851470947,
		"longitude": -80.1323623657227,
		"shape": null,
		"filename": "20150207-144340-18833.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-144340-18833.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:43:41",
		"updated": "2015-02-07T14:43:41",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.949,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.95,
		"tag_ids": [
			91
		],
		"session_id": 18833,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3553
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6203,
		"description": "",
		"latitude": 25.7821960449219,
		"longitude": -80.1327133178711,
		"shape": null,
		"filename": "20150207-145105-18840.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-145105-18840.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:51:06",
		"updated": "2015-02-07T14:51:06",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			91
		],
		"session_id": 18840,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3554
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6204,
		"description": "",
		"latitude": 25.7830142974854,
		"longitude": -80.1321258544922,
		"shape": null,
		"filename": "20150207-145435-18840.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-145435-18840.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T14:54:35",
		"updated": "2015-02-07T14:54:35",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.73,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 23.73,
		"tag_ids": [
			218
		],
		"session_id": 18840,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3555
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6205,
		"description": "",
		"latitude": 25.7829647064209,
		"longitude": -80.1325531005859,
		"shape": null,
		"filename": "20150207-154202-18784.wav",
		"file": "https://prod.roundware.com/rwmedia/20150207-154202-18784.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-07T15:42:03",
		"updated": "2015-02-07T15:42:03",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.648,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.65,
		"tag_ids": [
			91
		],
		"session_id": 18784,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3522
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6208,
		"description": "",
		"latitude": 25.7823905944824,
		"longitude": -80.1324005126953,
		"shape": null,
		"filename": "20150209-175349-18872.wav",
		"file": "https://prod.roundware.com/rwmedia/20150209-175349-18872.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-09T17:53:49",
		"updated": "2015-02-09T17:53:49",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.079,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.08,
		"tag_ids": [
			91
		],
		"session_id": 18872,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3558
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6281,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150226-070351-18987.wav",
		"file": "https://prod.roundware.com/rwmedia/20150226-070351-18987.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-02-26T07:03:52",
		"updated": "2015-02-26T07:03:52",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			91
		],
		"session_id": 18987,
		"project_id": 10,
		"language_id": 2,
		"envelope_ids": [
			3598
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6319,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150308-193458-19130.wav",
		"file": "https://prod.roundware.com/rwmedia/20150308-193458-19130.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-08T19:34:58",
		"updated": "2015-03-08T19:34:58",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.475,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.47,
		"tag_ids": [
			218
		],
		"session_id": 19130,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3624
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6320,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150308-193811-19131.wav",
		"file": "https://prod.roundware.com/rwmedia/20150308-193811-19131.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-08T19:38:12",
		"updated": "2015-03-08T19:38:12",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.808,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.81,
		"tag_ids": [
			218
		],
		"session_id": 19131,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3625
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6323,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150308-223316-19135.wav",
		"file": "https://prod.roundware.com/rwmedia/20150308-223316-19135.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-08T22:33:16",
		"updated": "2015-03-08T22:33:16",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.53,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.53,
		"tag_ids": [
			218
		],
		"session_id": 19135,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3628
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6324,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150308-224208-19136.wav",
		"file": "https://prod.roundware.com/rwmedia/20150308-224208-19136.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-08T22:42:08",
		"updated": "2015-03-08T22:42:08",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.136,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.14,
		"tag_ids": [
			218
		],
		"session_id": 19136,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3629
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6325,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150308-224350-19137.wav",
		"file": "https://prod.roundware.com/rwmedia/20150308-224350-19137.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-08T22:43:50",
		"updated": "2015-03-08T22:43:50",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.509,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.51,
		"tag_ids": [
			92
		],
		"session_id": 19137,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3630
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6328,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150309-093633-19151.wav",
		"file": "https://prod.roundware.com/rwmedia/20150309-093633-19151.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-09T09:36:33",
		"updated": "2015-03-09T09:36:33",
		"weight": 50,
		"start_time": 0,
		"end_time": 0.882,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 0.88,
		"tag_ids": [
			91
		],
		"session_id": 19151,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3634
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6336,
		"description": "",
		"latitude": 42.4983749389648,
		"longitude": -71.2807464599609,
		"shape": null,
		"filename": "20150311-221331-19216.wav",
		"file": "https://prod.roundware.com/rwmedia/20150311-221331-19216.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-11T22:13:32",
		"updated": "2015-03-11T22:13:32",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.944,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.94,
		"tag_ids": [
			218
		],
		"session_id": 19216,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3642
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6338,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150311-224253-19225.wav",
		"file": "https://prod.roundware.com/rwmedia/20150311-224253-19225.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-11T22:42:53",
		"updated": "2015-03-11T22:42:53",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.321,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.32,
		"tag_ids": [
			218
		],
		"session_id": 19225,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3644
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 6339,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20150312-181738-19252.wav",
		"file": "https://prod.roundware.com/rwmedia/20150312-181738-19252.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-03-12T18:17:38",
		"updated": "2015-03-12T18:17:38",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.207,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.21,
		"tag_ids": [
			92
		],
		"session_id": 19252,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			3645
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8158,
		"description": "",
		"latitude": 42.3745918273926,
		"longitude": -71.1517028808594,
		"shape": null,
		"filename": "20151217-095749-23516.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-095749-23516.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T09:57:49",
		"updated": "2015-12-17T09:57:49",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.099,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.1,
		"tag_ids": [
			92
		],
		"session_id": 23516,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4151
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8160,
		"description": "",
		"latitude": 42.3747253417969,
		"longitude": -71.1518707275391,
		"shape": null,
		"filename": "20151217-111337-23518.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111337-23518.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:13:38",
		"updated": "2015-12-17T11:13:38",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.534,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.53,
		"tag_ids": [
			91
		],
		"session_id": 23518,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4152
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8162,
		"description": "",
		"latitude": 42.3746185302734,
		"longitude": -71.1521453857422,
		"shape": null,
		"filename": "20151217-111500-23523.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111500-23523.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:15:01",
		"updated": "2015-12-17T11:15:01",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.546,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.55,
		"tag_ids": [
			92
		],
		"session_id": 23523,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4153
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8164,
		"description": "",
		"latitude": 42.3747520446777,
		"longitude": -71.1520767211914,
		"shape": null,
		"filename": "20151217-111514-23521.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111514-23521.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:15:14",
		"updated": "2015-12-17T11:15:14",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.272,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.27,
		"tag_ids": [
			92
		],
		"session_id": 23521,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4154
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8167,
		"description": "",
		"latitude": 42.3745002746582,
		"longitude": -71.1521224975586,
		"shape": null,
		"filename": "20151217-111626-23519.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111626-23519.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:16:27",
		"updated": "2015-12-17T11:16:27",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.122,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.12,
		"tag_ids": [
			91
		],
		"session_id": 23519,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4156
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8168,
		"description": "",
		"latitude": 42.3745727539062,
		"longitude": -71.1522064208984,
		"shape": null,
		"filename": "20151217-111627-23524.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111627-23524.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:16:28",
		"updated": "2015-12-17T11:16:28",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.462,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.46,
		"tag_ids": [
			218
		],
		"session_id": 23524,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4157
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8171,
		"description": "",
		"latitude": 42.3748207092285,
		"longitude": -71.1515655517578,
		"shape": null,
		"filename": "20151217-111636-23520.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111636-23520.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:16:37",
		"updated": "2015-12-17T11:16:37",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.659,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.66,
		"tag_ids": [
			91
		],
		"session_id": 23520,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4158
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8172,
		"description": "",
		"latitude": 42.3745880126953,
		"longitude": -71.1521148681641,
		"shape": null,
		"filename": "20151217-111638-23523.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111638-23523.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:16:38",
		"updated": "2015-12-17T11:16:38",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.247,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.25,
		"tag_ids": [
			91
		],
		"session_id": 23523,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4159
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8173,
		"description": "",
		"latitude": 42.374454498291,
		"longitude": -71.1519165039062,
		"shape": null,
		"filename": "20151217-111637-23525.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111637-23525.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:16:39",
		"updated": "2015-12-17T11:16:39",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.699,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.7,
		"tag_ids": [
			91
		],
		"session_id": 23525,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4155
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8175,
		"description": "",
		"latitude": 42.3744812011719,
		"longitude": -71.1520004272461,
		"shape": null,
		"filename": "20151217-111951-23528.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-111951-23528.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:19:51",
		"updated": "2015-12-17T11:19:51",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.735,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.74,
		"tag_ids": [
			92
		],
		"session_id": 23528,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4160
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8177,
		"description": "",
		"latitude": 42.3744812011719,
		"longitude": -71.1520385742188,
		"shape": null,
		"filename": "20151217-112218-23535.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112218-23535.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:22:18",
		"updated": "2015-12-17T11:22:18",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.851,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.85,
		"tag_ids": [
			91
		],
		"session_id": 23535,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4161
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8178,
		"description": "",
		"latitude": 42.3744773864746,
		"longitude": -71.1519622802734,
		"shape": null,
		"filename": "20151217-112248-23538.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112248-23538.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:22:48",
		"updated": "2015-12-17T11:22:48",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.232,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.23,
		"tag_ids": [
			218
		],
		"session_id": 23538,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4163
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8179,
		"description": "",
		"latitude": 42.3747138977051,
		"longitude": -71.1518630981445,
		"shape": null,
		"filename": "20151217-112249-23540.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112249-23540.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:22:49",
		"updated": "2015-12-17T11:22:49",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.551,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.55,
		"tag_ids": [
			91
		],
		"session_id": 23540,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4162
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8181,
		"description": "",
		"latitude": 42.3744773864746,
		"longitude": -71.1520309448242,
		"shape": null,
		"filename": "20151217-112319-23535.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112319-23535.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:23:20",
		"updated": "2015-12-17T11:23:20",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.458,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.46,
		"tag_ids": [
			92
		],
		"session_id": 23535,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4164
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8183,
		"description": "",
		"latitude": 42.3747024536133,
		"longitude": -71.1520690917969,
		"shape": null,
		"filename": "20151217-112414-23539.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112414-23539.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:24:15",
		"updated": "2015-12-17T11:24:15",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.357,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.36,
		"tag_ids": [
			218
		],
		"session_id": 23539,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4165
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8185,
		"description": "",
		"latitude": 42.3744773864746,
		"longitude": -71.1519546508789,
		"shape": null,
		"filename": "20151217-112443-23535.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112443-23535.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:24:45",
		"updated": "2015-12-17T11:24:45",
		"weight": 50,
		"start_time": 0,
		"end_time": 39.961,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 39.96,
		"tag_ids": [
			92
		],
		"session_id": 23535,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4166
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8186,
		"description": "",
		"latitude": 42.3746070861816,
		"longitude": -71.1520156860352,
		"shape": null,
		"filename": "20151217-112542-23535.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112542-23535.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:25:43",
		"updated": "2015-12-17T11:25:43",
		"weight": 50,
		"start_time": 0,
		"end_time": 44.698,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 44.7,
		"tag_ids": [
			92
		],
		"session_id": 23535,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4167
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8188,
		"description": "",
		"latitude": 42.3746490478516,
		"longitude": -71.1520462036133,
		"shape": null,
		"filename": "20151217-112641-23539.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112641-23539.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:26:42",
		"updated": "2015-12-17T11:26:42",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.207,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.21,
		"tag_ids": [
			218
		],
		"session_id": 23539,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4168
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8189,
		"description": "",
		"latitude": 42.3747215270996,
		"longitude": -71.1520538330078,
		"shape": null,
		"filename": "20151217-112650-23543.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112650-23543.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:26:51",
		"updated": "2015-12-17T11:26:51",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.786,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.79,
		"tag_ids": [
			92
		],
		"session_id": 23543,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4169
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8191,
		"description": "",
		"latitude": 42.3746795654297,
		"longitude": -71.1521301269531,
		"shape": null,
		"filename": "20151217-112751-23539.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112751-23539.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:27:52",
		"updated": "2015-12-17T11:27:52",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.89,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.89,
		"tag_ids": [
			91
		],
		"session_id": 23539,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4170
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 8192,
		"description": "",
		"latitude": 42.3746376037598,
		"longitude": -71.1522064208984,
		"shape": null,
		"filename": "20151217-112847-23539.wav",
		"file": "https://prod.roundware.com/rwmedia/20151217-112847-23539.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2015-12-17T11:28:48",
		"updated": "2015-12-17T11:28:48",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.829,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.83,
		"tag_ids": [
			91
		],
		"session_id": 23539,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4171
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9176,
		"description": "",
		"latitude": 42.3810560537319,
		"longitude": -71.1299145817757,
		"shape": null,
		"filename": "20160927-130207-25612.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130207-25612.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:02:08.308303",
		"updated": "2016-09-27T13:02:08.308303",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.074,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.07,
		"tag_ids": [
			246
		],
		"session_id": 25612,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4345
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9178,
		"description": "",
		"latitude": 42.3808299959663,
		"longitude": -71.1309360861778,
		"shape": null,
		"filename": "20160927-130235-25605.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130235-25605.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:02:36.085283",
		"updated": "2016-09-27T13:02:36.085283",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.687,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.69,
		"tag_ids": [
			246
		],
		"session_id": 25605,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4346
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9187,
		"description": "",
		"latitude": 42.3810545323193,
		"longitude": -71.1299247145653,
		"shape": null,
		"filename": "20160927-130338-25605.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130338-25605.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:03:39.143749",
		"updated": "2016-09-27T13:03:39.143749",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.195,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.2,
		"tag_ids": [
			246
		],
		"session_id": 25605,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4352
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9189,
		"description": "",
		"latitude": 42.380600783436,
		"longitude": -71.1314119398594,
		"shape": null,
		"filename": "20160927-130346-25604.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130346-25604.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:03:47.158796",
		"updated": "2016-09-27T13:03:47.158796",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.541,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.54,
		"tag_ids": [
			246
		],
		"session_id": 25604,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4351
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9194,
		"description": "",
		"latitude": 42.3806933479,
		"longitude": -71.1312850415707,
		"shape": null,
		"filename": "20160927-130505-25605.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130505-25605.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:05:05.419929",
		"updated": "2016-09-27T13:05:05.419929",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.616,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.62,
		"tag_ids": [
			246
		],
		"session_id": 25605,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4355
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9197,
		"description": "",
		"latitude": 42.3809836078111,
		"longitude": -71.130906701088,
		"shape": null,
		"filename": "20160927-130517-25605.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130517-25605.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:05:17.274127",
		"updated": "2016-09-27T13:05:17.274127",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.684,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.68,
		"tag_ids": [
			246
		],
		"session_id": 25605,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4356
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9202,
		"description": "",
		"latitude": 42.3805635898579,
		"longitude": -71.1310790846558,
		"shape": null,
		"filename": "20160927-130558-25609.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130558-25609.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:05:58.653272",
		"updated": "2016-09-27T13:05:58.653272",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.382,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.38,
		"tag_ids": [
			246
		],
		"session_id": 25609,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4359
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9204,
		"description": "",
		"latitude": 42.3807726276121,
		"longitude": -71.1315047740936,
		"shape": null,
		"filename": "20160927-130711-25604.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130711-25604.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:07:12.061573",
		"updated": "2016-09-27T13:07:12.061573",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.529,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.53,
		"tag_ids": [
			246
		],
		"session_id": 25604,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4360
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9206,
		"description": "",
		"latitude": 42.3807795621561,
		"longitude": -71.1315302550793,
		"shape": null,
		"filename": "20160927-130716-25604.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130716-25604.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:07:17.307131",
		"updated": "2016-09-27T13:07:17.307131",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.049,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.05,
		"tag_ids": [
			246
		],
		"session_id": 25604,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4362
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9211,
		"description": "",
		"latitude": 42.3809394836,
		"longitude": -71.1307373047,
		"shape": null,
		"filename": "20160927-130737-25605.wav",
		"file": "https://prod.roundware.com/rwmedia/20160927-130737-25605.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-27T13:07:37.784354",
		"updated": "2016-09-27T13:07:37.784354",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.48,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 35.48,
		"tag_ids": [
			246
		],
		"session_id": 25605,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4363
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9228,
		"description": "",
		"latitude": 42.3806408125477,
		"longitude": -71.1310135722286,
		"shape": null,
		"filename": "20160929-133527-25711.wav",
		"file": "https://prod.roundware.com/rwmedia/20160929-133527-25711.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-09-29T13:35:27.843272",
		"updated": "2016-09-29T13:35:27.843272",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.616,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.62,
		"tag_ids": [
			246
		],
		"session_id": 25711,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4397
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9233,
		"description": "",
		"latitude": 42.3808077720932,
		"longitude": -71.130671262741,
		"shape": null,
		"filename": "20161003-085300-25766.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-085300-25766.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T08:53:00.958183",
		"updated": "2016-10-03T08:53:00.958183",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.846,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 23.85,
		"tag_ids": [
			248
		],
		"session_id": 25766,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4401
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9234,
		"description": "",
		"latitude": 42.3810431775164,
		"longitude": -71.1299361884595,
		"shape": null,
		"filename": "20161003-085349-25766.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-085349-25766.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T08:53:49.634740",
		"updated": "2016-10-03T08:53:49.634740",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.896,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.9,
		"tag_ids": [
			246
		],
		"session_id": 25766,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4402
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9235,
		"description": "",
		"latitude": 42.3810188104449,
		"longitude": -71.1298865973949,
		"shape": null,
		"filename": "20161003-092043-25768.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-092043-25768.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T09:20:43.638121",
		"updated": "2016-10-03T09:20:43.638121",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.153,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.15,
		"tag_ids": [
			246
		],
		"session_id": 25768,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4403
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9236,
		"description": "",
		"latitude": 42.3810564549556,
		"longitude": -71.1299281716346,
		"shape": null,
		"filename": "20161003-092125-25768.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-092125-25768.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T09:21:25.469182",
		"updated": "2016-10-03T09:21:25.469182",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.918,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.92,
		"tag_ids": [
			247
		],
		"session_id": 25768,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4404
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9237,
		"description": "",
		"latitude": 42.3809501014676,
		"longitude": -71.1310312449932,
		"shape": null,
		"filename": "20161003-092943-25769.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-092943-25769.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T09:29:43.941952",
		"updated": "2016-10-03T09:29:43.941952",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.453,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.45,
		"tag_ids": [
			247
		],
		"session_id": 25769,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4405
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9238,
		"description": "",
		"latitude": 42.3807177428332,
		"longitude": -71.1313143372536,
		"shape": null,
		"filename": "20161003-120052-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120052-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:00:52.805743",
		"updated": "2016-10-03T12:00:52.805743",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.06,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.06,
		"tag_ids": [
			246
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4406
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9240,
		"description": "",
		"latitude": 42.3810406939239,
		"longitude": -71.1299249529839,
		"shape": null,
		"filename": "20161003-120244-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120244-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:02:44.817638",
		"updated": "2016-10-03T12:02:44.817638",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.383,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.38,
		"tag_ids": [
			247
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4407
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9241,
		"description": "",
		"latitude": 42.380965508111,
		"longitude": -71.1311016976833,
		"shape": null,
		"filename": "20161003-120347-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120347-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:03:47.872040",
		"updated": "2016-10-03T12:03:47.872040",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.693,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.69,
		"tag_ids": [
			247
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4408
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9243,
		"description": "",
		"latitude": 42.3805425007774,
		"longitude": -71.1309032142162,
		"shape": null,
		"filename": "20161003-120546-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120546-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:05:46.686303",
		"updated": "2016-10-03T12:05:46.686303",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.896,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.9,
		"tag_ids": [
			249
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4409
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9244,
		"description": "",
		"latitude": 42.3805936464408,
		"longitude": -71.1308661699295,
		"shape": null,
		"filename": "20161003-120738-25774.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120738-25774.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:07:38.879568",
		"updated": "2016-10-03T12:07:38.879568",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.599,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.6,
		"tag_ids": [
			249
		],
		"session_id": 25774,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4410
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9246,
		"description": "",
		"latitude": 42.380665444867,
		"longitude": -71.1307125985622,
		"shape": null,
		"filename": "20161003-120909-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-120909-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:09:09.993745",
		"updated": "2016-10-03T12:09:09.993745",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.52,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.52,
		"tag_ids": [
			248
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4411
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9247,
		"description": "",
		"latitude": 42.3808090890818,
		"longitude": -71.131478369236,
		"shape": null,
		"filename": "20161003-121047-25773.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-121047-25773.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:10:47.753714",
		"updated": "2016-10-03T12:10:47.753714",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.716,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.72,
		"tag_ids": [
			247
		],
		"session_id": 25773,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4412
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9248,
		"description": "",
		"latitude": 42.3806245770091,
		"longitude": -71.1308904588223,
		"shape": null,
		"filename": "20161003-121254-25775.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-121254-25775.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:12:54.355139",
		"updated": "2016-10-03T12:12:54.355139",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.701,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.7,
		"tag_ids": [
			249
		],
		"session_id": 25775,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4413
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9250,
		"description": "",
		"latitude": 42.3806359695008,
		"longitude": -71.1309304386378,
		"shape": null,
		"filename": "20161003-121545-25776.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-121545-25776.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:15:45.661656",
		"updated": "2016-10-03T12:15:45.661656",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.945,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.95,
		"tag_ids": [
			249
		],
		"session_id": 25776,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4414
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9252,
		"description": "",
		"latitude": 42.3805605836832,
		"longitude": -71.1309885382652,
		"shape": null,
		"filename": "20161003-121854-25776.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-121854-25776.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:18:54.951140",
		"updated": "2016-10-03T12:18:54.951140",
		"weight": 50,
		"start_time": 0,
		"end_time": 39.148,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 39.15,
		"tag_ids": [
			249
		],
		"session_id": 25776,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4415
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9254,
		"description": "",
		"latitude": 42.3809201309221,
		"longitude": -71.1312842965126,
		"shape": null,
		"filename": "20161003-122243-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-122243-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:22:43.542084",
		"updated": "2016-10-03T12:22:43.542084",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.45,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.45,
		"tag_ids": [
			247
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4416
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9255,
		"description": "",
		"latitude": 42.3805763755165,
		"longitude": -71.1308162510395,
		"shape": null,
		"filename": "20161003-122428-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-122428-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:24:28.675341",
		"updated": "2016-10-03T12:24:28.675341",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.397,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.4,
		"tag_ids": [
			248
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4417
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9257,
		"description": "",
		"latitude": 42.3806183959401,
		"longitude": -71.1306919157505,
		"shape": null,
		"filename": "20161003-122517-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-122517-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:25:17.538864",
		"updated": "2016-10-03T12:25:17.538864",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.17,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.17,
		"tag_ids": [
			248
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4418
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9259,
		"description": "",
		"latitude": 42.3809195533142,
		"longitude": -71.1314214766026,
		"shape": null,
		"filename": "20161003-122751-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-122751-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:27:52.399978",
		"updated": "2016-10-03T12:27:52.399978",
		"weight": 50,
		"start_time": 0,
		"end_time": 55.17,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 55.17,
		"tag_ids": [
			247
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4419
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9262,
		"description": "",
		"latitude": 42.3809869032732,
		"longitude": -71.1309946477413,
		"shape": null,
		"filename": "20161003-123107-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-123107-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:31:08.502441",
		"updated": "2016-10-03T12:31:08.502441",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.577,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.58,
		"tag_ids": [
			247
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4420
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9263,
		"description": "",
		"latitude": 42.3807372600306,
		"longitude": -71.1307371556759,
		"shape": null,
		"filename": "20161003-123342-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-123342-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:33:42.849664",
		"updated": "2016-10-03T12:33:42.849664",
		"weight": 50,
		"start_time": 0,
		"end_time": 59.698,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 59.7,
		"tag_ids": [
			248
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4421
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9264,
		"description": "",
		"latitude": 42.3809174687482,
		"longitude": -71.1314835846424,
		"shape": null,
		"filename": "20161003-123533-25777.wav",
		"file": "https://prod.roundware.com/rwmedia/20161003-123533-25777.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-03T12:35:33.506875",
		"updated": "2016-10-03T12:35:33.506875",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.03,
		"tag_ids": [
			247
		],
		"session_id": 25777,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4422
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9265,
		"description": "",
		"latitude": 42.3806864926995,
		"longitude": -71.130746871233,
		"shape": null,
		"filename": "20161004-120122-25792.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-120122-25792.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:01:23.293247",
		"updated": "2016-10-04T12:01:23.293247",
		"weight": 50,
		"start_time": 0,
		"end_time": 42.492,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 42.49,
		"tag_ids": [
			248
		],
		"session_id": 25792,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4423
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9266,
		"description": "",
		"latitude": 42.3806834691209,
		"longitude": -71.1306789666414,
		"shape": null,
		"filename": "20161004-120342-25793.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-120342-25793.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:03:42.760631",
		"updated": "2016-10-04T12:03:42.760631",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.791,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.79,
		"tag_ids": [
			248
		],
		"session_id": 25793,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4424
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9268,
		"description": "",
		"latitude": 42.3806834691209,
		"longitude": -71.1311478614807,
		"shape": null,
		"filename": "20161004-120746-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-120746-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:07:46.517618",
		"updated": "2016-10-04T12:07:46.517618",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.789,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.79,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4425
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9270,
		"description": "",
		"latitude": 42.3809171143295,
		"longitude": -71.1313663125038,
		"shape": null,
		"filename": "20161004-121013-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-121013-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:10:13.789996",
		"updated": "2016-10-04T12:10:13.789996",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.537,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 43.54,
		"tag_ids": [
			247
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4426
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9271,
		"description": "",
		"latitude": 42.3805386860658,
		"longitude": -71.1311195492744,
		"shape": null,
		"filename": "20161004-121212-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-121212-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:12:12.745599",
		"updated": "2016-10-04T12:12:12.745599",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.964,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.96,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4427
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9273,
		"description": "",
		"latitude": 42.380790414653,
		"longitude": -71.1311581134796,
		"shape": null,
		"filename": "20161004-121645-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-121645-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:16:46.058030",
		"updated": "2016-10-04T12:16:46.058030",
		"weight": 50,
		"start_time": 0,
		"end_time": 60,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4428
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9275,
		"description": "",
		"latitude": 42.3807706016715,
		"longitude": -71.1311299502849,
		"shape": null,
		"filename": "20161004-121837-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-121837-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:18:37.775858",
		"updated": "2016-10-04T12:18:37.775858",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.057,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.06,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4429
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9276,
		"description": "",
		"latitude": 42.3809673861533,
		"longitude": -71.1308375000953,
		"shape": null,
		"filename": "20161004-122125-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-122125-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:21:25.544043",
		"updated": "2016-10-04T12:21:25.544043",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.232,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.23,
		"tag_ids": [
			247
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4430
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9278,
		"description": "",
		"latitude": 42.3806919859262,
		"longitude": -71.1311714351177,
		"shape": null,
		"filename": "20161004-122359-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-122359-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:23:59.646010",
		"updated": "2016-10-04T12:23:59.646010",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.514,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.51,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4431
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9279,
		"description": "",
		"latitude": 42.3805703423095,
		"longitude": -71.130786716938,
		"shape": null,
		"filename": "20161004-122619-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-122619-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:26:20.213159",
		"updated": "2016-10-04T12:26:20.213159",
		"weight": 50,
		"start_time": 0,
		"end_time": 36.176,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 36.18,
		"tag_ids": [
			248
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4432
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9281,
		"description": "",
		"latitude": 42.3806410776508,
		"longitude": -71.1313284635544,
		"shape": null,
		"filename": "20161004-123059-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-123059-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:30:59.473361",
		"updated": "2016-10-04T12:30:59.473361",
		"weight": 50,
		"start_time": 0,
		"end_time": 29.884,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 29.88,
		"tag_ids": [
			246
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4433
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9283,
		"description": "",
		"latitude": 42.3805241806916,
		"longitude": -71.131070971489,
		"shape": null,
		"filename": "20161004-123422-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-123422-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:34:23.012358",
		"updated": "2016-10-04T12:34:23.012358",
		"weight": 50,
		"start_time": 0,
		"end_time": 58.676,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 58.68,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4434
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9284,
		"description": "",
		"latitude": 42.3806026794196,
		"longitude": -71.1311258375644,
		"shape": null,
		"filename": "20161004-123539-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-123539-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:35:39.409023",
		"updated": "2016-10-04T12:35:39.409023",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.04,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.04,
		"tag_ids": [
			249
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4435
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9285,
		"description": "",
		"latitude": 42.3807284920825,
		"longitude": -71.1311835050582,
		"shape": null,
		"filename": "20161004-123607-25794.wav",
		"file": "https://prod.roundware.com/rwmedia/20161004-123607-25794.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-04T12:36:07.236851",
		"updated": "2016-10-04T12:36:07.236851",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.051,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.05,
		"tag_ids": [
			246
		],
		"session_id": 25794,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4436
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9293,
		"description": "",
		"latitude": 42.3807501078559,
		"longitude": -71.1307046711444,
		"shape": null,
		"filename": "20161005-121152-25811.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-121152-25811.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:11:52.573508",
		"updated": "2016-10-05T12:11:52.573508",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.45,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.45,
		"tag_ids": [
			248
		],
		"session_id": 25811,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4443
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9294,
		"description": "",
		"latitude": 42.3806525217747,
		"longitude": -71.1313970386982,
		"shape": null,
		"filename": "20161005-121501-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-121501-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:15:01.765359",
		"updated": "2016-10-05T12:15:01.765359",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.185,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.19,
		"tag_ids": [
			246
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4444
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9295,
		"description": "",
		"latitude": 42.380542559407,
		"longitude": -71.1310389637947,
		"shape": null,
		"filename": "20161005-121604-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-121604-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:16:05.393249",
		"updated": "2016-10-05T12:16:05.393249",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.029,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.03,
		"tag_ids": [
			249
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4445
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9296,
		"description": "",
		"latitude": 42.3806590572684,
		"longitude": -71.1312783956527,
		"shape": null,
		"filename": "20161005-121852-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-121852-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:18:52.719065",
		"updated": "2016-10-05T12:18:52.719065",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.735,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.74,
		"tag_ids": [
			246
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4446
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9298,
		"description": "",
		"latitude": 42.3806025901365,
		"longitude": -71.1310088336467,
		"shape": null,
		"filename": "20161005-122141-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-122141-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:21:42.220263",
		"updated": "2016-10-05T12:21:42.220263",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			249
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4447
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9299,
		"description": "",
		"latitude": 42.3805972378167,
		"longitude": -71.1309368312358,
		"shape": null,
		"filename": "20161005-122333-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-122333-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:23:34.008271",
		"updated": "2021-03-25T13:03:54.664862",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			91
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4448
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9301,
		"description": "",
		"latitude": 42.3809350492285,
		"longitude": -71.1311809122562,
		"shape": null,
		"filename": "20161005-122554-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-122554-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:25:55.514994",
		"updated": "2016-10-05T12:25:55.514994",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			247
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4449
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9304,
		"description": "",
		"latitude": 42.3806790181824,
		"longitude": -71.1309110820293,
		"shape": null,
		"filename": "20161005-122902-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-122902-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:29:03.444561",
		"updated": "2016-10-05T12:29:03.444561",
		"weight": 50,
		"start_time": 0,
		"end_time": 51.316,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 51.32,
		"tag_ids": [
			249
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4450
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9305,
		"description": "",
		"latitude": 42.3807374665451,
		"longitude": -71.1312436759472,
		"shape": null,
		"filename": "20161005-123128-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-123128-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:31:28.583677",
		"updated": "2016-10-05T12:31:28.583677",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.537,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.54,
		"tag_ids": [
			246
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4451
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9306,
		"description": "",
		"latitude": 42.3807371121306,
		"longitude": -71.1307772099971,
		"shape": null,
		"filename": "20161005-123424-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-123424-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:34:25.305682",
		"updated": "2016-10-05T12:34:25.305682",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.727,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.73,
		"tag_ids": [
			248
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4452
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9308,
		"description": "",
		"latitude": 42.3807638596684,
		"longitude": -71.1311835646628,
		"shape": null,
		"filename": "20161005-123755-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-123755-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:37:56.109282",
		"updated": "2016-10-05T12:37:56.109282",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.264,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.26,
		"tag_ids": [
			249
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4453
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9309,
		"description": "",
		"latitude": 42.3805812841257,
		"longitude": -71.130665063858,
		"shape": null,
		"filename": "20161005-123800-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-123800-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:38:01.376777",
		"updated": "2016-10-05T12:38:01.376777",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.597,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.6,
		"tag_ids": [
			248
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4454
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9310,
		"description": "",
		"latitude": 42.3806892651246,
		"longitude": -71.1313530504704,
		"shape": null,
		"filename": "20161005-123931-25812.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-123931-25812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:39:31.774656",
		"updated": "2016-10-05T12:39:31.774656",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.476,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.48,
		"tag_ids": [
			246
		],
		"session_id": 25812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4455
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9312,
		"description": "",
		"latitude": 42.3806957043526,
		"longitude": -71.1311189085246,
		"shape": null,
		"filename": "20161005-124435-25813.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-124435-25813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:44:36.068928",
		"updated": "2016-10-05T12:44:36.068928",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.05,
		"tag_ids": [
			249
		],
		"session_id": 25813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4456
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9313,
		"description": "",
		"latitude": 42.3806278447626,
		"longitude": -71.1308265477419,
		"shape": null,
		"filename": "20161005-124527-25813.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-124527-25813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:45:28.192431",
		"updated": "2021-03-27T15:35:14.227175",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.425,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.43,
		"tag_ids": [
			263
		],
		"session_id": 25813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4457
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9315,
		"description": "",
		"latitude": 42.3806859973742,
		"longitude": -71.1312332600355,
		"shape": null,
		"filename": "20161005-124840-25813.wav",
		"file": "https://prod.roundware.com/rwmedia/20161005-124840-25813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-05T12:48:41.295639",
		"updated": "2016-10-05T12:48:41.295639",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.596,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.6,
		"tag_ids": [
			246
		],
		"session_id": 25813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4459
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9316,
		"description": "",
		"latitude": 42.3807366098418,
		"longitude": -71.1311479508877,
		"shape": null,
		"filename": "20161007-111804-25828.wav",
		"file": "https://prod.roundware.com/rwmedia/20161007-111804-25828.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-07T11:18:04.801817",
		"updated": "2016-10-07T11:18:04.801817",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.814,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.81,
		"tag_ids": [
			246
		],
		"session_id": 25828,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4460
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9317,
		"description": "",
		"latitude": 42.3805952425723,
		"longitude": -71.1307405232953,
		"shape": null,
		"filename": "20161007-111949-25828.wav",
		"file": "https://prod.roundware.com/rwmedia/20161007-111949-25828.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-07T11:19:49.822048",
		"updated": "2016-10-07T11:19:49.822048",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.059,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.06,
		"tag_ids": [
			248
		],
		"session_id": 25828,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4461
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9321,
		"description": "",
		"latitude": 42.380689402599,
		"longitude": -71.1307934293957,
		"shape": null,
		"filename": "20161013-084103-25867.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084103-25867.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:41:03.438339",
		"updated": "2016-10-13T08:41:03.438339",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.179,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.18,
		"tag_ids": [
			248
		],
		"session_id": 25867,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4465
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9322,
		"description": "",
		"latitude": 42.381036129321,
		"longitude": -71.129959262392,
		"shape": null,
		"filename": "20161013-084152-25867.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084152-25867.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:41:52.918325",
		"updated": "2016-10-13T08:41:52.918325",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.684,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.68,
		"tag_ids": [
			248
		],
		"session_id": 25867,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4466
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9323,
		"description": "",
		"latitude": 42.3806487859148,
		"longitude": -71.130757219574,
		"shape": null,
		"filename": "20161013-084227-25868.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084227-25868.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:42:27.679923",
		"updated": "2016-10-13T08:42:27.679923",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.848,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.85,
		"tag_ids": [
			248
		],
		"session_id": 25868,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4467
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9324,
		"description": "",
		"latitude": 42.3806428420077,
		"longitude": -71.1307947705002,
		"shape": null,
		"filename": "20161013-084400-25870.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084400-25870.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:44:00.662036",
		"updated": "2016-10-13T08:44:00.662036",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.894,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.89,
		"tag_ids": [
			248
		],
		"session_id": 25870,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4468
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9325,
		"description": "",
		"latitude": 42.3806695895856,
		"longitude": -71.130844391367,
		"shape": null,
		"filename": "20161013-084428-25870.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084428-25870.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:44:28.671393",
		"updated": "2016-10-13T08:44:28.671393",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.548,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.55,
		"tag_ids": [
			248
		],
		"session_id": 25870,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4469
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9326,
		"description": "",
		"latitude": 42.38076865459,
		"longitude": -71.130662001154,
		"shape": null,
		"filename": "20161013-084503-25870.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084503-25870.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:45:04.005294",
		"updated": "2016-10-13T08:45:04.005294",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.65,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.65,
		"tag_ids": [
			248
		],
		"session_id": 25870,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4470
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9327,
		"description": "",
		"latitude": 42.3808389906482,
		"longitude": -71.1310992012234,
		"shape": null,
		"filename": "20161013-084538-25870.wav",
		"file": "https://prod.roundware.com/rwmedia/20161013-084538-25870.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-13T08:45:38.708715",
		"updated": "2016-10-13T08:45:38.708715",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.303,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.3,
		"tag_ids": [
			248
		],
		"session_id": 25870,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4471
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9346,
		"description": "",
		"latitude": 42.380838,
		"longitude": -71.131122,
		"shape": null,
		"filename": "20161017-083441-25944.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083441-25944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:34:41.594681",
		"updated": "2016-10-17T08:34:41.594681",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.532,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.53,
		"tag_ids": [
			248
		],
		"session_id": 25944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4490
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9347,
		"description": "",
		"latitude": 42.3806610107422,
		"longitude": -71.130729675293,
		"shape": null,
		"filename": "20161017-083504-25942.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083504-25942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:35:04.898615",
		"updated": "2016-10-17T08:35:04.898615",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.442,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.44,
		"tag_ids": [
			248
		],
		"session_id": 25942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4491
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9348,
		"description": "",
		"latitude": 42.3806991577148,
		"longitude": -71.1306610107422,
		"shape": null,
		"filename": "20161017-083551-25949.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083551-25949.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:35:52.022671",
		"updated": "2016-10-17T08:35:52.022671",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.715,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.71,
		"tag_ids": [
			248
		],
		"session_id": 25949,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4492
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9349,
		"description": "",
		"latitude": 42.3809242248535,
		"longitude": -71.1312484741211,
		"shape": null,
		"filename": "20161017-083733-25953.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083733-25953.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:37:34.882190",
		"updated": "2021-03-27T15:34:32.047056",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.275,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.27,
		"tag_ids": [
			263
		],
		"session_id": 25953,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4493
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9350,
		"description": "",
		"latitude": 42.380838,
		"longitude": -71.131122,
		"shape": null,
		"filename": "20161017-083856-25952.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083856-25952.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:38:57.649320",
		"updated": "2016-10-17T08:38:57.649320",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.718,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.72,
		"tag_ids": [
			247
		],
		"session_id": 25952,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4494
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9351,
		"description": "",
		"latitude": 42.3808517456055,
		"longitude": -71.131591796875,
		"shape": null,
		"filename": "20161017-083857-25953.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083857-25953.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:38:59.062764",
		"updated": "2016-10-17T08:38:59.062764",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.501,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.5,
		"tag_ids": [
			248
		],
		"session_id": 25953,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4495
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9352,
		"description": "",
		"latitude": 42.3806648254395,
		"longitude": -71.1313400268555,
		"shape": null,
		"filename": "20161017-083901-25942.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083901-25942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:39:03.518540",
		"updated": "2016-10-17T08:39:03.518540",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.444,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.44,
		"tag_ids": [
			249
		],
		"session_id": 25942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4496
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9353,
		"description": "",
		"latitude": 42.3805770874023,
		"longitude": -71.1313934326172,
		"shape": null,
		"filename": "20161017-083929-25949.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083929-25949.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:39:29.906201",
		"updated": "2016-10-17T08:39:29.906201",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.633,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.63,
		"tag_ids": [
			247
		],
		"session_id": 25949,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4497
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9354,
		"description": "",
		"latitude": 42.3809776306152,
		"longitude": -71.1308364868164,
		"shape": null,
		"filename": "20161017-083938-25946.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-083938-25946.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:39:39.620937",
		"updated": "2016-10-17T08:39:39.620937",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.489,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.49,
		"tag_ids": [
			247
		],
		"session_id": 25946,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4498
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9355,
		"description": "",
		"latitude": 42.380838,
		"longitude": -71.131122,
		"shape": null,
		"filename": "20161017-084012-25952.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084012-25952.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:40:14.226409",
		"updated": "2016-10-17T08:40:14.226409",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.154,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.15,
		"tag_ids": [
			246
		],
		"session_id": 25952,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4499
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9356,
		"description": "",
		"latitude": 42.3806114196777,
		"longitude": -71.1315460205078,
		"shape": null,
		"filename": "20161017-084016-25941.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084016-25941.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:40:21.225467",
		"updated": "2016-10-17T08:40:21.225467",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.517,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.52,
		"tag_ids": [
			249
		],
		"session_id": 25941,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4500
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9357,
		"description": "",
		"latitude": 42.380838,
		"longitude": -71.131122,
		"shape": null,
		"filename": "20161017-084040-25952.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084040-25952.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:40:41.141021",
		"updated": "2016-10-17T08:40:41.141021",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.031,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.03,
		"tag_ids": [
			246
		],
		"session_id": 25952,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4501
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9358,
		"description": "",
		"latitude": 42.3806266784668,
		"longitude": -71.131462097168,
		"shape": null,
		"filename": "20161017-084057-25961.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084057-25961.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:40:58.929828",
		"updated": "2016-10-17T08:40:58.929828",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.411,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.41,
		"tag_ids": [
			247
		],
		"session_id": 25961,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4502
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9359,
		"description": "",
		"latitude": 42.3806381225586,
		"longitude": -71.1308059692383,
		"shape": null,
		"filename": "20161017-084106-25946.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084106-25946.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:41:07.385127",
		"updated": "2016-10-17T08:41:07.385127",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.851,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.85,
		"tag_ids": [
			248
		],
		"session_id": 25946,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4503
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9360,
		"description": "",
		"latitude": 42.3805389404297,
		"longitude": -71.1315383911133,
		"shape": null,
		"filename": "20161017-084122-25941.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084122-25941.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:41:23.159076",
		"updated": "2016-10-17T08:41:23.159076",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.845,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.84,
		"tag_ids": [
			246
		],
		"session_id": 25941,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4504
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9361,
		"description": "",
		"latitude": 42.3806648254395,
		"longitude": -71.1315536499023,
		"shape": null,
		"filename": "20161017-084210-25942.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084210-25942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:42:12.179102",
		"updated": "2016-10-17T08:42:12.179102",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.605,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.61,
		"tag_ids": [
			246
		],
		"session_id": 25942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4505
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9362,
		"description": "",
		"latitude": 42.3805809020996,
		"longitude": -71.1315231323242,
		"shape": null,
		"filename": "20161017-084244-25946.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084244-25946.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:42:45.462633",
		"updated": "2016-10-17T08:42:45.462633",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.17,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.17,
		"tag_ids": [
			246
		],
		"session_id": 25946,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4506
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9363,
		"description": "",
		"latitude": 42.3809958310968,
		"longitude": -71.131321400404,
		"shape": null,
		"filename": "20161017-084303-25941.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084303-25941.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:43:04.527119",
		"updated": "2016-10-17T08:43:04.527119",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.854,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.85,
		"tag_ids": [
			247
		],
		"session_id": 25941,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4507
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9364,
		"description": "",
		"latitude": 42.3809891335019,
		"longitude": -71.131142437458,
		"shape": null,
		"filename": "20161017-084348-25942.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084348-25942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:43:49.875461",
		"updated": "2016-10-17T08:43:49.875461",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.823,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.82,
		"tag_ids": [
			247
		],
		"session_id": 25942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4508
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9365,
		"description": "",
		"latitude": 42.380838,
		"longitude": -71.131122,
		"shape": null,
		"filename": "20161017-084424-25952.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084424-25952.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:44:25.214110",
		"updated": "2016-10-17T08:44:25.214110",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.405,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.4,
		"tag_ids": [
			247
		],
		"session_id": 25952,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4509
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9367,
		"description": "",
		"latitude": 42.3806838989258,
		"longitude": -71.1309356689453,
		"shape": null,
		"filename": "20161017-084437-25941.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084437-25941.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:44:37.988930",
		"updated": "2016-10-17T08:44:37.988930",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.052,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.05,
		"tag_ids": [
			248
		],
		"session_id": 25941,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4510
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9368,
		"description": "",
		"latitude": 42.3806037902832,
		"longitude": -71.1310272216797,
		"shape": null,
		"filename": "20161017-084525-25958.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084525-25958.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:45:26.889905",
		"updated": "2021-03-25T13:03:41.613954",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.238,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.24,
		"tag_ids": [
			91
		],
		"session_id": 25958,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4512
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9370,
		"description": "",
		"latitude": 42.3807144165039,
		"longitude": -71.1316909790039,
		"shape": null,
		"filename": "20161017-084619-25963.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084619-25963.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:46:20.015154",
		"updated": "2016-10-17T08:46:20.015154",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.671,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.67,
		"tag_ids": [
			249
		],
		"session_id": 25963,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4511
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9373,
		"description": "",
		"latitude": 42.3807144165039,
		"longitude": -71.1316909790039,
		"shape": null,
		"filename": "20161017-084640-25963.wav",
		"file": "https://prod.roundware.com/rwmedia/20161017-084640-25963.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2016-10-17T08:46:41.102265",
		"updated": "2016-10-17T08:46:41.102265",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.16,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.16,
		"tag_ids": [
			248
		],
		"session_id": 25963,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4513
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9725,
		"description": "",
		"latitude": 42.4986038208008,
		"longitude": -71.2810363769531,
		"shape": null,
		"filename": "20170316-102118-29886.wav",
		"file": "https://prod.roundware.com/rwmedia/20170316-102118-29886.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-16T10:21:18.464411",
		"updated": "2017-03-16T10:21:18.464411",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.383,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.38,
		"tag_ids": [
			248
		],
		"session_id": 29886,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4817
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9740,
		"description": "",
		"latitude": 40.7684745788574,
		"longitude": -73.9650421142578,
		"shape": null,
		"filename": "20170318-112934-29937.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-112934-29937.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:29:35.483224",
		"updated": "2017-03-18T11:29:35.483224",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.325,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.32,
		"tag_ids": [
			262
		],
		"session_id": 29937,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4829
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9742,
		"description": "",
		"latitude": 40.7683525085449,
		"longitude": -73.9643249511719,
		"shape": null,
		"filename": "20170318-114225-29942.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-114225-29942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:42:26.768881",
		"updated": "2017-03-18T11:42:26.768881",
		"weight": 50,
		"start_time": 0,
		"end_time": 54.845,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 54.84,
		"tag_ids": [
			262
		],
		"session_id": 29942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4830
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9743,
		"description": "",
		"latitude": 40.7680473327637,
		"longitude": -73.9641189575195,
		"shape": null,
		"filename": "20170318-114536-29944.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-114536-29944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:45:36.578162",
		"updated": "2017-03-18T11:45:36.578162",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.266,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.27,
		"tag_ids": [
			263
		],
		"session_id": 29944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4831
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9745,
		"description": "",
		"latitude": 40.7692680358887,
		"longitude": -73.9646911621094,
		"shape": null,
		"filename": "20170318-114702-29942.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-114702-29942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:47:03.044826",
		"updated": "2017-03-18T11:47:03.044826",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.198,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.2,
		"tag_ids": [
			262
		],
		"session_id": 29942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4832
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9746,
		"description": "",
		"latitude": 40.7685813903809,
		"longitude": -73.9637298583984,
		"shape": null,
		"filename": "20170318-114714-29944.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-114714-29944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:47:14.983710",
		"updated": "2017-03-18T11:47:14.983710",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.269,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.27,
		"tag_ids": [
			262
		],
		"session_id": 29944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4833
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9747,
		"description": "",
		"latitude": 40.7687492370605,
		"longitude": -73.9640655517578,
		"shape": null,
		"filename": "20170318-114845-29944.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-114845-29944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:48:46.085651",
		"updated": "2017-03-18T11:48:46.085651",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.786,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.79,
		"tag_ids": [
			262
		],
		"session_id": 29944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4834
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9748,
		"description": "",
		"latitude": 40.7690658569336,
		"longitude": -73.9650650024414,
		"shape": null,
		"filename": "20170318-115055-29944.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-115055-29944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:50:55.743302",
		"updated": "2017-03-18T11:50:55.743302",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.03,
		"tag_ids": [
			263
		],
		"session_id": 29944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4835
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9750,
		"description": "",
		"latitude": 40.7686653137207,
		"longitude": -73.9655532836914,
		"shape": null,
		"filename": "20170318-115301-29944.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-115301-29944.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:53:01.717445",
		"updated": "2017-03-18T11:53:01.717445",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.284,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.28,
		"tag_ids": [
			263
		],
		"session_id": 29944,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4837
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9751,
		"description": "",
		"latitude": 40.7683792114258,
		"longitude": -73.9636001586914,
		"shape": null,
		"filename": "20170318-115344-29942.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-115344-29942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:53:45.537131",
		"updated": "2017-03-18T11:53:45.537131",
		"weight": 50,
		"start_time": 0,
		"end_time": 51.408,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 51.41,
		"tag_ids": [
			262
		],
		"session_id": 29942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4836
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9753,
		"description": "",
		"latitude": 40.7685890197754,
		"longitude": -73.9655227661133,
		"shape": null,
		"filename": "20170318-115721-29945.wav",
		"file": "https://prod.roundware.com/rwmedia/20170318-115721-29945.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-18T11:57:22.618111",
		"updated": "2017-03-18T11:57:22.618111",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.09,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.09,
		"tag_ids": [
			262
		],
		"session_id": 29945,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4838
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9765,
		"description": "",
		"latitude": 42.3805465698242,
		"longitude": -71.1312026977539,
		"shape": null,
		"filename": "20170329-153542-30256.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-153542-30256.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:35:43.718543",
		"updated": "2017-03-29T15:35:43.718543",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.705,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.71,
		"tag_ids": [
			247
		],
		"session_id": 30256,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4851
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9766,
		"description": "",
		"latitude": 42.3805618286133,
		"longitude": -71.131217956543,
		"shape": null,
		"filename": "20170329-153730-30258.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-153730-30258.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:37:30.983722",
		"updated": "2017-03-29T15:37:30.983722",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.64,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.64,
		"tag_ids": [
			247
		],
		"session_id": 30258,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4852
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9767,
		"description": "",
		"latitude": 42.3805503845215,
		"longitude": -71.1313400268555,
		"shape": null,
		"filename": "20170329-153812-30254.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-153812-30254.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:38:13.177740",
		"updated": "2017-03-29T15:38:13.177740",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.944,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.94,
		"tag_ids": [
			249
		],
		"session_id": 30254,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4853
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9768,
		"description": "",
		"latitude": 42.3805923461914,
		"longitude": -71.1314849853516,
		"shape": null,
		"filename": "20170329-153826-30277.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-153826-30277.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:38:27.082748",
		"updated": "2017-03-29T15:38:27.082748",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.565,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.56,
		"tag_ids": [
			249
		],
		"session_id": 30277,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4854
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9769,
		"description": "",
		"latitude": 42.3806533813477,
		"longitude": -71.1315994262695,
		"shape": null,
		"filename": "20170329-153923-30235.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-153923-30235.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:39:24.500679",
		"updated": "2017-03-29T15:39:24.500679",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.997,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17,
		"tag_ids": [
			247
		],
		"session_id": 30235,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4855
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9770,
		"description": "",
		"latitude": 42.3805618286133,
		"longitude": -71.1311721801758,
		"shape": null,
		"filename": "20170329-154006-30252.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-154006-30252.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:40:06.423061",
		"updated": "2017-03-29T15:40:06.423061",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.13,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.13,
		"tag_ids": [
			249
		],
		"session_id": 30252,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4856
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9771,
		"description": "",
		"latitude": 42.3805732727051,
		"longitude": -71.1312789916992,
		"shape": null,
		"filename": "20170329-154114-30274.wav",
		"file": "https://prod.roundware.com/rwmedia/20170329-154114-30274.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-03-29T15:41:15.806939",
		"updated": "2017-03-29T15:41:15.806939",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.154,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.15,
		"tag_ids": [
			249
		],
		"session_id": 30274,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4857
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 9821,
		"description": "",
		"latitude": 42.3808174133301,
		"longitude": -71.1310806274414,
		"shape": null,
		"filename": "20170501-183858-30928.wav",
		"file": "https://prod.roundware.com/rwmedia/20170501-183858-30928.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-05-01T18:38:59.249718",
		"updated": "2017-05-01T18:38:59.249718",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.492,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.49,
		"tag_ids": [
			218
		],
		"session_id": 30928,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			4903
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10014,
		"description": "",
		"latitude": 40.9945030212402,
		"longitude": -111.933624267578,
		"shape": null,
		"filename": "20170709-031449-32331.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-031449-32331.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T03:14:50.702717",
		"updated": "2017-07-09T03:14:50.702717",
		"weight": 50,
		"start_time": 0,
		"end_time": 57.817,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 57.82,
		"tag_ids": [
			218
		],
		"session_id": 32331,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5047
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10017,
		"description": "",
		"latitude": 40.9951095581055,
		"longitude": -111.935424804688,
		"shape": null,
		"filename": "20170709-164703-32340.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-164703-32340.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T16:47:04.807440",
		"updated": "2017-07-09T16:47:04.807440",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			92
		],
		"session_id": 32340,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5048
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10019,
		"description": "",
		"latitude": 40.9945182800293,
		"longitude": -111.933647155762,
		"shape": null,
		"filename": "20170709-172101-32346.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-172101-32346.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T17:21:02.211594",
		"updated": "2017-07-09T17:21:02.211594",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.65,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.65,
		"tag_ids": [
			92
		],
		"session_id": 32346,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5049
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10020,
		"description": "",
		"latitude": 40.994815826416,
		"longitude": -111.935165405273,
		"shape": null,
		"filename": "20170709-174831-32350.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-174831-32350.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T17:48:32.061167",
		"updated": "2017-07-09T17:48:32.061167",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.04,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.04,
		"tag_ids": [
			91
		],
		"session_id": 32350,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5050
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10021,
		"description": "",
		"latitude": 40.9955711364746,
		"longitude": -111.935241699219,
		"shape": null,
		"filename": "20170709-181132-32352.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-181132-32352.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T18:11:33.038516",
		"updated": "2017-07-09T18:11:33.038516",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.297,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.3,
		"tag_ids": [
			91
		],
		"session_id": 32352,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5051
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10022,
		"description": "",
		"latitude": 40.9964637756348,
		"longitude": -111.934982299805,
		"shape": null,
		"filename": "20170709-181510-32352.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-181510-32352.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T18:15:10.532314",
		"updated": "2017-07-09T18:15:10.532314",
		"weight": 50,
		"start_time": 0,
		"end_time": 45.418,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 45.42,
		"tag_ids": [
			91
		],
		"session_id": 32352,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5052
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10023,
		"description": "",
		"latitude": 40.9945640563965,
		"longitude": -111.933647155762,
		"shape": null,
		"filename": "20170709-215624-32379.wav",
		"file": "https://prod.roundware.com/rwmedia/20170709-215624-32379.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-09T21:56:25.499393",
		"updated": "2017-07-09T21:56:25.499393",
		"weight": 50,
		"start_time": 0,
		"end_time": 52.244,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 52.24,
		"tag_ids": [
			218
		],
		"session_id": 32379,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5053
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10024,
		"description": "",
		"latitude": 41.0416259765625,
		"longitude": -111.921615600586,
		"shape": null,
		"filename": "20170710-000142-32386.wav",
		"file": "https://prod.roundware.com/rwmedia/20170710-000142-32386.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-10T00:01:42.764076",
		"updated": "2017-07-10T00:01:42.764076",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.213,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.21,
		"tag_ids": [
			91
		],
		"session_id": 32386,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5054
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10025,
		"description": "",
		"latitude": 41.0421333312988,
		"longitude": -111.921592712402,
		"shape": null,
		"filename": "20170710-001219-32389.wav",
		"file": "https://prod.roundware.com/rwmedia/20170710-001219-32389.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-10T00:12:19.885037",
		"updated": "2017-07-10T00:12:19.885037",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.718,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.72,
		"tag_ids": [
			218
		],
		"session_id": 32389,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5055
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10026,
		"description": "",
		"latitude": 40.9853286743164,
		"longitude": -111.893211364746,
		"shape": null,
		"filename": "20170711-234215-32413.wav",
		"file": "https://prod.roundware.com/rwmedia/20170711-234215-32413.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-11T23:42:16.398747",
		"updated": "2017-07-11T23:42:16.398747",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.074,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.07,
		"tag_ids": [
			91
		],
		"session_id": 32413,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5056
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10027,
		"description": "",
		"latitude": 40.9852561950684,
		"longitude": -111.89379119873,
		"shape": null,
		"filename": "20170711-235120-32414.wav",
		"file": "https://prod.roundware.com/rwmedia/20170711-235120-32414.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-11T23:51:20.786141",
		"updated": "2017-07-11T23:51:20.786141",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.795,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.8,
		"tag_ids": [
			91
		],
		"session_id": 32414,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5057
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10029,
		"description": "",
		"latitude": 40.9945373535156,
		"longitude": -111.933631896973,
		"shape": null,
		"filename": "20170713-112141-32445.wav",
		"file": "https://prod.roundware.com/rwmedia/20170713-112141-32445.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-13T11:21:42.185932",
		"updated": "2017-07-13T11:21:42.185932",
		"weight": 50,
		"start_time": 0,
		"end_time": 52.848,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 52.85,
		"tag_ids": [
			218
		],
		"session_id": 32445,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5059
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10030,
		"description": "",
		"latitude": 40.7601203918457,
		"longitude": -111.874664306641,
		"shape": null,
		"filename": "20170713-142545-32448.wav",
		"file": "https://prod.roundware.com/rwmedia/20170713-142545-32448.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-13T14:25:45.412275",
		"updated": "2017-07-13T14:25:45.412275",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.981,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.98,
		"tag_ids": [
			218
		],
		"session_id": 32448,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5060
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10031,
		"description": "",
		"latitude": 41.0825614929199,
		"longitude": -111.983451843262,
		"shape": null,
		"filename": "20170714-221527-32458.wav",
		"file": "https://prod.roundware.com/rwmedia/20170714-221527-32458.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-14T22:15:28.094815",
		"updated": "2017-07-14T22:15:28.094815",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.609,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.61,
		"tag_ids": [
			91
		],
		"session_id": 32458,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5061
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10032,
		"description": "",
		"latitude": 40.9946098327637,
		"longitude": -111.932640075684,
		"shape": null,
		"filename": "20170715-002725-32461.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-002725-32461.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:27:25.833639",
		"updated": "2017-07-15T00:27:25.833639",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.353,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.35,
		"tag_ids": [
			218
		],
		"session_id": 32461,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5062
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10033,
		"description": "",
		"latitude": 40.9945755004883,
		"longitude": -111.932647705078,
		"shape": null,
		"filename": "20170715-003027-32462.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-003027-32462.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:30:27.724411",
		"updated": "2017-07-15T00:30:27.724411",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.405,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.4,
		"tag_ids": [
			91
		],
		"session_id": 32462,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5063
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10034,
		"description": "",
		"latitude": 40.9945755004883,
		"longitude": -111.932655334473,
		"shape": null,
		"filename": "20170715-003531-32464.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-003531-32464.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:35:32.031392",
		"updated": "2017-07-15T00:35:32.031392",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.222,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.22,
		"tag_ids": [
			91
		],
		"session_id": 32464,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5064
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10035,
		"description": "",
		"latitude": 40.9945869445801,
		"longitude": -111.932647705078,
		"shape": null,
		"filename": "20170715-003822-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-003822-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:38:22.502283",
		"updated": "2017-07-15T00:38:22.502283",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.216,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.22,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5065
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10036,
		"description": "",
		"latitude": 40.9945869445801,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20170715-004007-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-004007-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:40:07.336296",
		"updated": "2017-07-15T00:40:07.336296",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.894,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.89,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5066
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10037,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932678222656,
		"shape": null,
		"filename": "20170715-004248-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-004248-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:42:48.325669",
		"updated": "2017-07-15T00:42:48.325669",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.919,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.92,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5067
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10038,
		"description": "",
		"latitude": 40.9946022033691,
		"longitude": -111.932670593262,
		"shape": null,
		"filename": "20170715-004501-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-004501-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:45:01.963729",
		"updated": "2017-07-15T00:45:01.963729",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.117,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.12,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5068
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10039,
		"description": "",
		"latitude": 40.9946098327637,
		"longitude": -111.932678222656,
		"shape": null,
		"filename": "20170715-004604-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-004604-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:46:04.414257",
		"updated": "2017-07-15T00:46:04.414257",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.427,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.43,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5069
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10040,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20170715-005119-32465.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-005119-32465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T00:51:20.195139",
		"updated": "2017-07-15T00:51:20.195139",
		"weight": 50,
		"start_time": 0,
		"end_time": 41.285,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 41.28,
		"tag_ids": [
			91
		],
		"session_id": 32465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5070
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10041,
		"description": "",
		"latitude": 40.9946212768555,
		"longitude": -111.932624816895,
		"shape": null,
		"filename": "20170715-010120-32467.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-010120-32467.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T01:01:21.158380",
		"updated": "2017-07-15T01:01:21.158380",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.046,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.05,
		"tag_ids": [
			91
		],
		"session_id": 32467,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5071
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10042,
		"description": "",
		"latitude": 40.9945678710938,
		"longitude": -111.932624816895,
		"shape": null,
		"filename": "20170715-010245-32467.wav",
		"file": "https://prod.roundware.com/rwmedia/20170715-010245-32467.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-15T01:02:45.450453",
		"updated": "2017-07-15T01:02:45.450453",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.031,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.03,
		"tag_ids": [
			91
		],
		"session_id": 32467,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5072
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10046,
		"description": "",
		"latitude": 41.0412940979004,
		"longitude": -111.921081542969,
		"shape": null,
		"filename": "20170717-002207-32488.wav",
		"file": "https://prod.roundware.com/rwmedia/20170717-002207-32488.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-17T00:22:07.764917",
		"updated": "2017-07-17T00:22:07.764917",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			91
		],
		"session_id": 32488,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5076
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10047,
		"description": "",
		"latitude": 41.0018997192383,
		"longitude": -111.906936645508,
		"shape": null,
		"filename": "20170717-235027-32507.wav",
		"file": "https://prod.roundware.com/rwmedia/20170717-235027-32507.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-17T23:50:27.987819",
		"updated": "2017-07-17T23:50:27.987819",
		"weight": 50,
		"start_time": 0,
		"end_time": 49.272,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 49.27,
		"tag_ids": [
			91
		],
		"session_id": 32507,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5078
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10048,
		"description": "",
		"latitude": 42.5725517272949,
		"longitude": -113.730522155762,
		"shape": null,
		"filename": "20170720-013053-32531.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-013053-32531.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T01:30:53.951105",
		"updated": "2017-07-20T01:30:53.951105",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.774,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.77,
		"tag_ids": [
			91
		],
		"session_id": 32531,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5079
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10049,
		"description": "",
		"latitude": 42.5725746154785,
		"longitude": -113.730529785156,
		"shape": null,
		"filename": "20170720-015546-32533.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-015546-32533.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T01:55:47.326766",
		"updated": "2017-07-20T01:55:47.326766",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.405,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 23.41,
		"tag_ids": [
			91
		],
		"session_id": 32533,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5080
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10050,
		"description": "",
		"latitude": 42.6920776367188,
		"longitude": -114.519111633301,
		"shape": null,
		"filename": "20170720-024858-32537.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-024858-32537.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T02:48:58.914388",
		"updated": "2017-07-20T02:48:58.914388",
		"weight": 50,
		"start_time": 0,
		"end_time": 56.47,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 56.47,
		"tag_ids": [
			91
		],
		"session_id": 32537,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5081
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10051,
		"description": "",
		"latitude": 44.0165710449219,
		"longitude": -116.944160461426,
		"shape": null,
		"filename": "20170720-161242-32539.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-161242-32539.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T16:12:42.813157",
		"updated": "2017-07-20T16:12:42.813157",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.839,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 43.84,
		"tag_ids": [
			91
		],
		"session_id": 32539,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5082
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10052,
		"description": "MacAuley Schenker Group",
		"latitude": 45.3223114013672,
		"longitude": -118.084854125977,
		"shape": null,
		"filename": "20170720-181645-32545.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-181645-32545.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T18:16:45.760213",
		"updated": "2017-07-20T18:16:45.760213",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.709,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.71,
		"tag_ids": [
			91
		],
		"session_id": 32545,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5083
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10053,
		"description": "",
		"latitude": 45.6014404296875,
		"longitude": -118.508079528809,
		"shape": null,
		"filename": "20170720-190857-32547.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-190857-32547.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T19:08:58.200881",
		"updated": "2017-07-20T19:08:58.200881",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.189,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 43.19,
		"tag_ids": [
			91
		],
		"session_id": 32547,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5084
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10054,
		"description": "",
		"latitude": 45.7207412719727,
		"longitude": -119.016151428223,
		"shape": null,
		"filename": "20170720-194636-32551.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-194636-32551.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T19:46:37.432172",
		"updated": "2017-07-20T19:46:37.432172",
		"weight": 50,
		"start_time": 0,
		"end_time": 53.313,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 53.31,
		"tag_ids": [
			91
		],
		"session_id": 32551,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5085
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10055,
		"description": "",
		"latitude": 45.6225471496582,
		"longitude": -121.213752746582,
		"shape": null,
		"filename": "20170720-215654-32555.wav",
		"file": "https://prod.roundware.com/rwmedia/20170720-215654-32555.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-20T21:56:54.916336",
		"updated": "2017-07-20T21:56:54.916336",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.644,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.64,
		"tag_ids": [
			91
		],
		"session_id": 32555,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5086
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10056,
		"description": "",
		"latitude": 45.6930770874023,
		"longitude": -121.567337036133,
		"shape": null,
		"filename": "20170722-141436-32567.wav",
		"file": "https://prod.roundware.com/rwmedia/20170722-141436-32567.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-22T14:14:37.844424",
		"updated": "2017-07-22T14:14:37.844424",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.03,
		"tag_ids": [
			91
		],
		"session_id": 32567,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5087
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10059,
		"description": "",
		"latitude": 42.5726509094238,
		"longitude": -113.730499267578,
		"shape": null,
		"filename": "20170723-151848-32593.wav",
		"file": "https://prod.roundware.com/rwmedia/20170723-151848-32593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-23T15:18:48.930519",
		"updated": "2017-07-23T15:18:48.930519",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.337,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.34,
		"tag_ids": [
			92
		],
		"session_id": 32593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5091
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10060,
		"description": "",
		"latitude": 42.6921577453613,
		"longitude": -114.51895904541,
		"shape": null,
		"filename": "20170723-162037-32604.wav",
		"file": "https://prod.roundware.com/rwmedia/20170723-162037-32604.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-23T16:20:38.266110",
		"updated": "2017-07-23T16:20:38.266110",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.925,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.92,
		"tag_ids": [
			92
		],
		"session_id": 32604,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5092
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10061,
		"description": "",
		"latitude": 45.5777206420898,
		"longitude": -122.117126464844,
		"shape": null,
		"filename": "20170724-152220-32571.wav",
		"file": "https://prod.roundware.com/rwmedia/20170724-152220-32571.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-24T15:22:21.602550",
		"updated": "2017-07-24T15:22:21.602550",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.817,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.82,
		"tag_ids": [
			91
		],
		"session_id": 32571,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5088
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10062,
		"description": "",
		"latitude": 45.6123352050781,
		"longitude": -123.943885803223,
		"shape": null,
		"filename": "20170724-152414-32640.wav",
		"file": "https://prod.roundware.com/rwmedia/20170724-152414-32640.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-24T15:24:15.541634",
		"updated": "2017-07-24T15:24:15.541634",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.096,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.1,
		"tag_ids": [
			91
		],
		"session_id": 32640,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5093
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10063,
		"description": "",
		"latitude": 45.6128768920898,
		"longitude": -123.943771362305,
		"shape": null,
		"filename": "20170724-164014-32644.wav",
		"file": "https://prod.roundware.com/rwmedia/20170724-164014-32644.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-24T16:40:14.731995",
		"updated": "2017-07-24T16:40:14.731995",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.021,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.02,
		"tag_ids": [
			91
		],
		"session_id": 32644,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5094
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10064,
		"description": "",
		"latitude": 45.4401702880859,
		"longitude": -123.952644348145,
		"shape": null,
		"filename": "20170725-040012-32650.wav",
		"file": "https://prod.roundware.com/rwmedia/20170725-040012-32650.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-25T04:00:12.886905",
		"updated": "2017-07-25T04:00:12.886905",
		"weight": 50,
		"start_time": 0,
		"end_time": 49.272,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 49.27,
		"tag_ids": [
			91
		],
		"session_id": 32650,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5095
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10065,
		"description": "",
		"latitude": 45.3398551940918,
		"longitude": -123.992530822754,
		"shape": null,
		"filename": "20170726-174903-32661.wav",
		"file": "https://prod.roundware.com/rwmedia/20170726-174903-32661.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-26T17:49:03.563768",
		"updated": "2017-07-26T17:49:03.563768",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.826,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.83,
		"tag_ids": [
			91
		],
		"session_id": 32661,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5096
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10066,
		"description": "",
		"latitude": 45.9251708984375,
		"longitude": -123.978721618652,
		"shape": null,
		"filename": "20170727-225504-32674.wav",
		"file": "https://prod.roundware.com/rwmedia/20170727-225504-32674.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-27T22:55:05.613433",
		"updated": "2017-07-27T22:55:05.613433",
		"weight": 50,
		"start_time": 0,
		"end_time": 53.963,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 53.96,
		"tag_ids": [
			91
		],
		"session_id": 32674,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5097
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10070,
		"description": "",
		"latitude": 45.214786529541,
		"longitude": -123.969337463379,
		"shape": null,
		"filename": "20170729-172309-32709.wav",
		"file": "https://prod.roundware.com/rwmedia/20170729-172309-32709.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-07-29T17:23:10.371190",
		"updated": "2017-07-29T17:23:10.371190",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.978,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.98,
		"tag_ids": [
			91
		],
		"session_id": 32709,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5101
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10100,
		"description": "",
		"latitude": 40.9946022033691,
		"longitude": -111.932624816895,
		"shape": null,
		"filename": "20170916-232441-33369.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-232441-33369.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:24:42.178878",
		"updated": "2017-09-16T23:24:42.178878",
		"weight": 50,
		"start_time": 0,
		"end_time": 51.501,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 51.5,
		"tag_ids": [
			91
		],
		"session_id": 33369,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5139
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10101,
		"description": "",
		"latitude": 40.9946022033691,
		"longitude": -111.9326171875,
		"shape": null,
		"filename": "20170916-232804-33369.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-232804-33369.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:28:04.570945",
		"updated": "2017-09-16T23:28:04.570945",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.511,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.51,
		"tag_ids": [
			91
		],
		"session_id": 33369,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5140
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10102,
		"description": "",
		"latitude": 40.9946022033691,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20170916-233251-33370.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-233251-33370.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:32:51.986313",
		"updated": "2017-09-16T23:32:51.986313",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.86,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.86,
		"tag_ids": [
			91
		],
		"session_id": 33370,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5141
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10103,
		"description": "",
		"latitude": 40.9945869445801,
		"longitude": -111.932624816895,
		"shape": null,
		"filename": "20170916-233621-33370.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-233621-33370.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:36:21.733050",
		"updated": "2017-09-16T23:36:21.733050",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.579,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.58,
		"tag_ids": [
			91
		],
		"session_id": 33370,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5142
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10104,
		"description": "",
		"latitude": 40.9945755004883,
		"longitude": -111.932640075684,
		"shape": null,
		"filename": "20170916-234420-33371.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-234420-33371.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:44:21.497619",
		"updated": "2017-09-16T23:44:21.497619",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.092,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.09,
		"tag_ids": [
			91
		],
		"session_id": 33371,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5143
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10105,
		"description": "",
		"latitude": 40.9945869445801,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20170916-234913-33371.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-234913-33371.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:49:14.268173",
		"updated": "2017-09-16T23:49:14.268173",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.659,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.66,
		"tag_ids": [
			91
		],
		"session_id": 33371,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5144
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10106,
		"description": "",
		"latitude": 40.9945259094238,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20170916-235127-33371.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-235127-33371.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:51:27.318206",
		"updated": "2017-09-16T23:51:27.318206",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.136,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.14,
		"tag_ids": [
			91
		],
		"session_id": 33371,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5145
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10107,
		"description": "",
		"latitude": 40.9945220947266,
		"longitude": -111.932670593262,
		"shape": null,
		"filename": "20170916-235252-33372.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-235252-33372.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:52:53.131487",
		"updated": "2017-09-16T23:52:53.131487",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.436,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.44,
		"tag_ids": [
			91
		],
		"session_id": 33372,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5146
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10108,
		"description": "",
		"latitude": 40.9945297241211,
		"longitude": -111.932685852051,
		"shape": null,
		"filename": "20170916-235431-33372.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-235431-33372.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:54:31.348385",
		"updated": "2017-09-16T23:54:31.348385",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.467,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.47,
		"tag_ids": [
			91
		],
		"session_id": 33372,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5147
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10109,
		"description": "",
		"latitude": 40.9945411682129,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20170916-235622-33372.wav",
		"file": "https://prod.roundware.com/rwmedia/20170916-235622-33372.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-16T23:56:23.409386",
		"updated": "2017-09-16T23:56:23.409386",
		"weight": 50,
		"start_time": 0,
		"end_time": 33.39,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 33.39,
		"tag_ids": [
			91
		],
		"session_id": 33372,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5148
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10110,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932685852051,
		"shape": null,
		"filename": "20170917-000137-33372.wav",
		"file": "https://prod.roundware.com/rwmedia/20170917-000137-33372.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-09-17T00:01:38.018948",
		"updated": "2017-09-17T00:01:38.018948",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.557,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.56,
		"tag_ids": [
			91
		],
		"session_id": 33372,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5149
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10119,
		"description": "",
		"latitude": 42.498706817627,
		"longitude": -71.2811737060547,
		"shape": null,
		"filename": "20171001-112931-33625.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-112931-33625.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:29:31.944604",
		"updated": "2017-10-01T11:29:31.944604",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.681,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.68,
		"tag_ids": [
			218
		],
		"session_id": 33625,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5158
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10120,
		"description": "",
		"latitude": 40.7592124938965,
		"longitude": -73.9846343994141,
		"shape": null,
		"filename": "20171001-114443-33628.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-114443-33628.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:44:44.044879",
		"updated": "2017-10-01T11:44:44.044879",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.613,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.61,
		"tag_ids": [
			91
		],
		"session_id": 33628,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5160
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10121,
		"description": "",
		"latitude": 42.4985466003418,
		"longitude": -71.2809524536133,
		"shape": null,
		"filename": "20171001-114736-33629.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-114736-33629.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:47:36.274949",
		"updated": "2017-10-01T11:47:36.274949",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.876,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.88,
		"tag_ids": [
			218
		],
		"session_id": 33629,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5161
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10122,
		"description": "",
		"latitude": 42.4985466003418,
		"longitude": -71.2809524536133,
		"shape": null,
		"filename": "20171001-114902-33629.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-114902-33629.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:49:02.945469",
		"updated": "2017-10-01T11:49:02.945469",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.876,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.88,
		"tag_ids": [
			218
		],
		"session_id": 33629,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5161
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10123,
		"description": "",
		"latitude": 42.4985504150391,
		"longitude": -71.2809600830078,
		"shape": null,
		"filename": "20171001-114909-33630.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-114909-33630.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:49:09.952380",
		"updated": "2017-10-01T11:49:09.952380",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.69,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.69,
		"tag_ids": [
			92
		],
		"session_id": 33630,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5162
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10124,
		"description": "",
		"latitude": 42.4985733032227,
		"longitude": -71.2810516357422,
		"shape": null,
		"filename": "20171001-115309-33631.wav",
		"file": "https://prod.roundware.com/rwmedia/20171001-115309-33631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-01T11:53:09.373208",
		"updated": "2017-10-01T11:53:09.373208",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.315,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.32,
		"tag_ids": [
			92
		],
		"session_id": 33631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5163
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10129,
		"description": "",
		"latitude": 44.2365074157715,
		"longitude": -68.9273223876953,
		"shape": null,
		"filename": "20171007-135749-33825.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-135749-33825.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T13:57:50.032131",
		"updated": "2017-10-07T13:57:50.032131",
		"weight": 50,
		"start_time": 0,
		"end_time": 33.25,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 33.25,
		"tag_ids": [
			91
		],
		"session_id": 33825,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5168
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10131,
		"description": "",
		"latitude": 44.2364120483398,
		"longitude": -68.9276657104492,
		"shape": null,
		"filename": "20171007-135931-33825.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-135931-33825.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T13:59:31.524638",
		"updated": "2017-10-07T13:59:31.524638",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.173,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.17,
		"tag_ids": [
			91
		],
		"session_id": 33825,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5169
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10133,
		"description": "",
		"latitude": 44.2365226745605,
		"longitude": -68.9279708862305,
		"shape": null,
		"filename": "20171007-140105-33825.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-140105-33825.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:01:06.067920",
		"updated": "2017-10-07T14:01:06.067920",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.164,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.16,
		"tag_ids": [
			91
		],
		"session_id": 33825,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5170
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10137,
		"description": "",
		"latitude": 44.2365646362305,
		"longitude": -68.9280014038086,
		"shape": null,
		"filename": "20171007-141932-33825.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-141932-33825.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:19:32.980352",
		"updated": "2017-10-07T14:19:32.980352",
		"weight": 50,
		"start_time": 0,
		"end_time": 22.244,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 22.24,
		"tag_ids": [
			91
		],
		"session_id": 33825,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5171
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10138,
		"description": "",
		"latitude": 44.2364311218262,
		"longitude": -68.9283905029297,
		"shape": null,
		"filename": "20171007-141939-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-141939-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:19:39.949654",
		"updated": "2017-10-07T14:19:39.949654",
		"weight": 50,
		"start_time": 0,
		"end_time": 22.801,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 22.8,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5172
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10140,
		"description": "",
		"latitude": 44.2365226745605,
		"longitude": -68.9286346435547,
		"shape": null,
		"filename": "20171007-142055-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-142055-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:20:56.104821",
		"updated": "2017-10-07T14:20:56.104821",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.328,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.33,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5173
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10143,
		"description": "",
		"latitude": 44.2368011474609,
		"longitude": -68.928466796875,
		"shape": null,
		"filename": "20171007-142344-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-142344-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:23:44.650014",
		"updated": "2017-10-07T14:23:44.650014",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.086,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.09,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5174
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10146,
		"description": "",
		"latitude": 44.2368545532227,
		"longitude": -68.9284286499023,
		"shape": null,
		"filename": "20171007-142646-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-142646-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:26:47.094649",
		"updated": "2017-10-07T14:26:47.094649",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.306,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.31,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5175
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10151,
		"description": "",
		"latitude": 44.2369918823242,
		"longitude": -68.9283905029297,
		"shape": null,
		"filename": "20171007-143119-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-143119-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:31:20.197172",
		"updated": "2017-10-07T14:31:20.197172",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.752,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.75,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5176
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10153,
		"description": "",
		"latitude": 44.2371711730957,
		"longitude": -68.9286270141602,
		"shape": null,
		"filename": "20171007-143250-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-143250-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:32:50.633490",
		"updated": "2017-10-07T14:32:50.633490",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.969,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.97,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5177
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10157,
		"description": "",
		"latitude": 44.2373733520508,
		"longitude": -68.9288024902344,
		"shape": null,
		"filename": "20171007-143628-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-143628-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:36:29.164518",
		"updated": "2017-10-07T14:36:29.164518",
		"weight": 50,
		"start_time": 0,
		"end_time": 47.6,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47.6,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5178
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10159,
		"description": "",
		"latitude": 44.237434387207,
		"longitude": -68.9291915893555,
		"shape": null,
		"filename": "20171007-143805-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-143805-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:38:06.044776",
		"updated": "2017-10-07T14:38:06.044776",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.532,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.53,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5179
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10162,
		"description": "",
		"latitude": 44.2375907897949,
		"longitude": -68.9292907714844,
		"shape": null,
		"filename": "20171007-144039-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-144039-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:40:40.315328",
		"updated": "2017-10-07T14:40:40.315328",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.096,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.1,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5180
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10166,
		"description": "",
		"latitude": 44.2374992370605,
		"longitude": -68.9291915893555,
		"shape": null,
		"filename": "20171007-144402-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-144402-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:44:03.224601",
		"updated": "2017-10-07T14:44:03.224601",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.254,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.25,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5181
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10168,
		"description": "",
		"latitude": 44.2374687194824,
		"longitude": -68.9289321899414,
		"shape": null,
		"filename": "20171007-144532-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-144532-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:45:33.020113",
		"updated": "2017-10-07T14:45:33.020113",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.024,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.02,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5182
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10171,
		"description": "",
		"latitude": 44.237247467041,
		"longitude": -68.9289855957031,
		"shape": null,
		"filename": "20171007-144814-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-144814-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:48:15.088899",
		"updated": "2017-10-07T14:48:15.088899",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.096,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.1,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5183
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10173,
		"description": "",
		"latitude": 44.2371292114258,
		"longitude": -68.9288864135742,
		"shape": null,
		"filename": "20171007-144945-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-144945-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:49:45.843586",
		"updated": "2017-10-07T14:49:45.843586",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.328,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.33,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5184
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10175,
		"description": "",
		"latitude": 44.2370986938477,
		"longitude": -68.9286422729492,
		"shape": null,
		"filename": "20171007-145109-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-145109-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:51:10.051836",
		"updated": "2017-10-07T14:51:10.051836",
		"weight": 50,
		"start_time": 0,
		"end_time": 32.972,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 32.97,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5185
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10179,
		"description": "",
		"latitude": 44.2369689941406,
		"longitude": -68.9288482666016,
		"shape": null,
		"filename": "20171007-145521-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-145521-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:55:22.381966",
		"updated": "2017-10-07T14:55:22.381966",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.867,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.87,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5186
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10181,
		"description": "",
		"latitude": 44.2368621826172,
		"longitude": -68.9287948608398,
		"shape": null,
		"filename": "20171007-145631-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-145631-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T14:56:32.376933",
		"updated": "2017-10-07T14:56:32.376933",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.266,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 38.27,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5187
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10185,
		"description": "",
		"latitude": 44.2368812561035,
		"longitude": -68.9284362792969,
		"shape": null,
		"filename": "20171007-150051-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-150051-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T15:00:51.467627",
		"updated": "2017-10-07T15:00:51.467627",
		"weight": 50,
		"start_time": 0,
		"end_time": 42.306,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 42.31,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5188
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10188,
		"description": "",
		"latitude": 44.2368507385254,
		"longitude": -68.9281616210938,
		"shape": null,
		"filename": "20171007-150331-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-150331-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T15:03:31.653803",
		"updated": "2017-10-07T15:03:31.653803",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.136,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.14,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5189
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10190,
		"description": "",
		"latitude": 44.2367324829102,
		"longitude": -68.9278030395508,
		"shape": null,
		"filename": "20171007-150502-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-150502-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T15:05:02.403764",
		"updated": "2017-10-07T15:05:02.403764",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.43,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5190
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10193,
		"description": "",
		"latitude": 44.2364273071289,
		"longitude": -68.9273147583008,
		"shape": null,
		"filename": "20171007-150804-33827.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-150804-33827.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T15:08:04.416700",
		"updated": "2017-10-07T15:08:04.416700",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.315,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.32,
		"tag_ids": [
			91
		],
		"session_id": 33827,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5191
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10194,
		"description": "",
		"latitude": 44.236385345459,
		"longitude": -68.9295196533203,
		"shape": null,
		"filename": "20171007-163726-33838.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-163726-33838.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:37:27.244744",
		"updated": "2017-10-07T16:37:27.244744",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.486,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.49,
		"tag_ids": [
			91
		],
		"session_id": 33838,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5192
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10195,
		"description": "",
		"latitude": 44.236198425293,
		"longitude": -68.9292755126953,
		"shape": null,
		"filename": "20171007-163734-33838.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-163734-33838.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:37:35.045066",
		"updated": "2017-10-07T16:37:35.045066",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.368,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.37,
		"tag_ids": [
			91
		],
		"session_id": 33838,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5193
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10197,
		"description": "",
		"latitude": 44.2364196777344,
		"longitude": -68.9291763305664,
		"shape": null,
		"filename": "20171007-164145-33838.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-164145-33838.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:41:45.679739",
		"updated": "2017-10-07T16:41:45.679739",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.498,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.5,
		"tag_ids": [
			91
		],
		"session_id": 33838,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5194
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10199,
		"description": "",
		"latitude": 44.2367820739746,
		"longitude": -68.9290466308594,
		"shape": null,
		"filename": "20171007-164338-33838.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-164338-33838.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:43:38.976013",
		"updated": "2017-10-07T16:43:38.976013",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.226,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.23,
		"tag_ids": [
			91
		],
		"session_id": 33838,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5195
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10201,
		"description": "",
		"latitude": 44.2367324829102,
		"longitude": -68.928840637207,
		"shape": null,
		"filename": "20171007-164836-33838.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-164836-33838.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:48:37.267162",
		"updated": "2017-10-07T16:48:37.267162",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.758,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.76,
		"tag_ids": [
			91
		],
		"session_id": 33838,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5196
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10203,
		"description": "",
		"latitude": 44.2368431091309,
		"longitude": -68.9291915893555,
		"shape": null,
		"filename": "20171007-164927-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-164927-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:49:27.940738",
		"updated": "2017-10-07T16:49:27.940738",
		"weight": 50,
		"start_time": 0,
		"end_time": 36.826,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 36.83,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5197
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10205,
		"description": "",
		"latitude": 44.2366981506348,
		"longitude": -68.9292297363281,
		"shape": null,
		"filename": "20171007-165049-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-165049-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:50:49.533023",
		"updated": "2017-10-07T16:50:49.533023",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.566,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.57,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5198
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10207,
		"description": "",
		"latitude": 44.2367210388184,
		"longitude": -68.9294815063477,
		"shape": null,
		"filename": "20171007-165241-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-165241-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:52:41.862048",
		"updated": "2017-10-07T16:52:41.862048",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.774,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.77,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5199
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10209,
		"description": "",
		"latitude": 44.2367477416992,
		"longitude": -68.9296798706055,
		"shape": null,
		"filename": "20171007-165412-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-165412-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:54:13.172498",
		"updated": "2017-10-07T16:54:13.172498",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.247,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.25,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5200
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10213,
		"description": "",
		"latitude": 44.2371444702148,
		"longitude": -68.929328918457,
		"shape": null,
		"filename": "20171007-165813-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-165813-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T16:58:13.684137",
		"updated": "2017-10-07T16:58:13.684137",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.133,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 34.13,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5201
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10215,
		"description": "",
		"latitude": 44.2371940612793,
		"longitude": -68.9291610717773,
		"shape": null,
		"filename": "20171007-170052-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-170052-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:00:53.389368",
		"updated": "2017-10-07T17:00:53.389368",
		"weight": 50,
		"start_time": 0,
		"end_time": 33.854,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 33.85,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5202
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10218,
		"description": "",
		"latitude": 44.2372131347656,
		"longitude": -68.9290771484375,
		"shape": null,
		"filename": "20171007-170652-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-170652-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:06:53.192074",
		"updated": "2017-10-07T17:06:53.192074",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.867,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.87,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5203
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10219,
		"description": "",
		"latitude": 44.2372589111328,
		"longitude": -68.9290084838867,
		"shape": null,
		"filename": "20171007-170655-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-170655-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:06:56.354340",
		"updated": "2017-10-07T17:06:56.354340",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.535,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.54,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5204
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10223,
		"description": "",
		"latitude": 44.2372665405273,
		"longitude": -68.9288177490234,
		"shape": null,
		"filename": "20171007-171102-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-171102-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:11:02.795714",
		"updated": "2017-10-07T17:11:02.795714",
		"weight": 50,
		"start_time": 0,
		"end_time": 51.687,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 51.69,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5205
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10226,
		"description": "",
		"latitude": 44.2385330200195,
		"longitude": -68.9287338256836,
		"shape": null,
		"filename": "20171007-171417-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-171417-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:14:18.104027",
		"updated": "2017-10-07T17:14:18.104027",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.764,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 31.76,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5206
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10231,
		"description": "",
		"latitude": 44.2370986938477,
		"longitude": -68.929817199707,
		"shape": null,
		"filename": "20171007-172027-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-172027-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:20:28.078401",
		"updated": "2017-10-07T17:20:28.078401",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.068,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.07,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5207
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10233,
		"description": "",
		"latitude": 44.2366256713867,
		"longitude": -68.9301986694336,
		"shape": null,
		"filename": "20171007-172131-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-172131-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:21:31.947401",
		"updated": "2017-10-07T17:21:31.947401",
		"weight": 50,
		"start_time": 0,
		"end_time": 26.842,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 26.84,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5208
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10235,
		"description": "",
		"latitude": 44.2364692687988,
		"longitude": -68.9299697875977,
		"shape": null,
		"filename": "20171007-172350-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-172350-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:23:51.402630",
		"updated": "2017-10-07T17:23:51.402630",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.306,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.31,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5209
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10238,
		"description": "",
		"latitude": 44.2363700866699,
		"longitude": -68.9310531616211,
		"shape": null,
		"filename": "20171007-172727-33839.wav",
		"file": "https://prod.roundware.com/rwmedia/20171007-172727-33839.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-07T17:27:28.221645",
		"updated": "2017-10-07T17:27:28.221645",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.987,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.99,
		"tag_ids": [
			91
		],
		"session_id": 33839,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5210
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10240,
		"description": "",
		"latitude": 44.2371940612793,
		"longitude": -68.9288635253906,
		"shape": null,
		"filename": "20171008-153450-33854.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-153450-33854.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T15:34:50.373607",
		"updated": "2017-10-08T15:34:50.373607",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.328,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.33,
		"tag_ids": [
			91
		],
		"session_id": 33854,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5212
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10242,
		"description": "",
		"latitude": 44.237232208252,
		"longitude": -68.9289398193359,
		"shape": null,
		"filename": "20171008-162006-33855.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-162006-33855.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T16:20:06.341928",
		"updated": "2017-10-08T16:20:06.341928",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.743,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.74,
		"tag_ids": [
			91
		],
		"session_id": 33855,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5213
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10244,
		"description": "",
		"latitude": 44.2371864318848,
		"longitude": -68.9289627075195,
		"shape": null,
		"filename": "20171008-162155-33855.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-162155-33855.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T16:21:56.128277",
		"updated": "2017-10-08T16:21:56.128277",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.953,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.95,
		"tag_ids": [
			91
		],
		"session_id": 33855,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5214
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10245,
		"description": "",
		"latitude": 44.2348442077637,
		"longitude": -68.9314270019531,
		"shape": null,
		"filename": "20171008-162204-33855.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-162204-33855.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T16:22:04.394044",
		"updated": "2017-10-08T16:22:04.394044",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.671,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.67,
		"tag_ids": [
			91
		],
		"session_id": 33855,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5215
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10249,
		"description": "",
		"latitude": 44.2340049743652,
		"longitude": -68.9310684204102,
		"shape": null,
		"filename": "20171008-165618-33855.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-165618-33855.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T16:56:19.053530",
		"updated": "2017-10-08T16:56:19.053530",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.337,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.34,
		"tag_ids": [
			91
		],
		"session_id": 33855,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5216
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10251,
		"description": "",
		"latitude": 44.2343521118164,
		"longitude": -68.9310073852539,
		"shape": null,
		"filename": "20171008-170936-33856.wav",
		"file": "https://prod.roundware.com/rwmedia/20171008-170936-33856.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-08T17:09:36.649358",
		"updated": "2017-10-08T17:09:36.649358",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.52,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.52,
		"tag_ids": [
			91
		],
		"session_id": 33856,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5217
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10264,
		"description": "",
		"latitude": 39.112548828125,
		"longitude": -105.888664245605,
		"shape": null,
		"filename": "20171014-153722-34062.wav",
		"file": "https://prod.roundware.com/rwmedia/20171014-153722-34062.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-14T15:37:23.307936",
		"updated": "2017-10-14T15:37:23.307936",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.678,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.68,
		"tag_ids": [
			91
		],
		"session_id": 34062,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5230
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10265,
		"description": "",
		"latitude": 39.2237205505371,
		"longitude": -106.002471923828,
		"shape": null,
		"filename": "20171014-220903-34064.wav",
		"file": "https://prod.roundware.com/rwmedia/20171014-220903-34064.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-14T22:09:04.431695",
		"updated": "2017-10-14T22:09:04.431695",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			91
		],
		"session_id": 34064,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5231
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10267,
		"description": "",
		"latitude": 39.2237396240234,
		"longitude": -106.002532958984,
		"shape": null,
		"filename": "20171014-223231-34064.wav",
		"file": "https://prod.roundware.com/rwmedia/20171014-223231-34064.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-14T22:32:32.183364",
		"updated": "2017-10-14T22:32:32.183364",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			91
		],
		"session_id": 34064,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5232
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10268,
		"description": "",
		"latitude": 39.2237815856934,
		"longitude": -106.002540588379,
		"shape": null,
		"filename": "20171014-224457-34064.wav",
		"file": "https://prod.roundware.com/rwmedia/20171014-224457-34064.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-10-14T22:44:58.453508",
		"updated": "2017-10-14T22:44:58.453508",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			91
		],
		"session_id": 34064,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5233
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10295,
		"description": "",
		"latitude": 42.3571701049805,
		"longitude": -71.1484222412109,
		"shape": null,
		"filename": "20171103-161440-34447.wav",
		"file": "https://prod.roundware.com/rwmedia/20171103-161440-34447.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2017-11-03T16:14:40.572495",
		"updated": "2017-11-03T16:14:40.572495",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.421,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.42,
		"tag_ids": [
			91
		],
		"session_id": 34447,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5251
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10514,
		"description": "",
		"latitude": 42.3772773742676,
		"longitude": -71.1123275756836,
		"shape": null,
		"filename": "20180202-115131-36051.wav",
		"file": "https://prod.roundware.com/rwmedia/20180202-115131-36051.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-02-02T11:51:31.948130",
		"updated": "2018-02-02T11:51:31.948130",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.746,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 28.75,
		"tag_ids": [
			91
		],
		"session_id": 36051,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5457
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10584,
		"description": "",
		"latitude": 37.3939208984375,
		"longitude": -122.041313171387,
		"shape": null,
		"filename": "20180315-120955-36843.wav",
		"file": "https://prod.roundware.com/rwmedia/20180315-120955-36843.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-03-15T12:09:55.439081",
		"updated": "2018-03-15T12:09:55.439081",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.925,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.92,
		"tag_ids": [
			91
		],
		"session_id": 36843,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5528
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10585,
		"description": "",
		"latitude": 37.3939018249512,
		"longitude": -122.041305541992,
		"shape": null,
		"filename": "20180315-121106-36844.wav",
		"file": "https://prod.roundware.com/rwmedia/20180315-121106-36844.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-03-15T12:11:06.239332",
		"updated": "2018-03-15T12:11:06.239332",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.414,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.41,
		"tag_ids": [
			92
		],
		"session_id": 36844,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5529
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10589,
		"description": "",
		"latitude": 37.3939208984375,
		"longitude": -122.041328430176,
		"shape": null,
		"filename": "20180315-153936-36860.wav",
		"file": "https://prod.roundware.com/rwmedia/20180315-153936-36860.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-03-15T15:39:36.240225",
		"updated": "2018-03-15T15:39:36.240225",
		"weight": 50,
		"start_time": 0,
		"end_time": 1.486,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 1.49,
		"tag_ids": [
			91
		],
		"session_id": 36860,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5532
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10721,
		"description": "",
		"latitude": 40.3210296630859,
		"longitude": -88.9748001098633,
		"shape": null,
		"filename": "20180605-151418-38177.wav",
		"file": "https://prod.roundware.com/rwmedia/20180605-151418-38177.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-05T15:14:18.340197",
		"updated": "2018-06-05T15:14:18.340197",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.845,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.85,
		"tag_ids": [
			218
		],
		"session_id": 38177,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5670
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10724,
		"description": "",
		"latitude": 50.949581,
		"longitude": 3.129959,
		"shape": null,
		"filename": "20180614-083100-38279.wav",
		"file": "https://prod.roundware.com/rwmedia/20180614-083100-38279.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-14T08:31:00.317928",
		"updated": "2018-06-14T08:31:00.317928",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.975,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.97,
		"tag_ids": [
			91
		],
		"session_id": 38279,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5674
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10725,
		"description": "",
		"latitude": 50.949419,
		"longitude": 3.129646,
		"shape": null,
		"filename": "20180614-083505-38279.wav",
		"file": "https://prod.roundware.com/rwmedia/20180614-083505-38279.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-14T08:35:05.402573",
		"updated": "2018-06-14T08:35:05.402573",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.185,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.19,
		"tag_ids": [
			91
		],
		"session_id": 38279,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5675
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10730,
		"description": "",
		"latitude": 50.948341,
		"longitude": 3.130199,
		"shape": null,
		"filename": "20180616-085522-38317.wav",
		"file": "https://prod.roundware.com/rwmedia/20180616-085522-38317.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-16T08:55:23.248077",
		"updated": "2018-06-16T08:55:23.248077",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.235,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.23,
		"tag_ids": [
			91
		],
		"session_id": 38317,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5679
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10732,
		"description": "",
		"latitude": 50.948555,
		"longitude": 3.130216,
		"shape": null,
		"filename": "20180616-085817-38317.wav",
		"file": "https://prod.roundware.com/rwmedia/20180616-085817-38317.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-16T08:58:18.109894",
		"updated": "2018-06-16T08:58:18.109894",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.266,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.27,
		"tag_ids": [
			91
		],
		"session_id": 38317,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5680
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10733,
		"description": "",
		"latitude": 49.948593,
		"longitude": 3.129639,
		"shape": null,
		"filename": "20180616-101555-38320.wav",
		"file": "https://prod.roundware.com/rwmedia/20180616-101555-38320.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-06-16T10:15:55.129441",
		"updated": "2018-06-16T10:15:55.129441",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.709,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.71,
		"tag_ids": [
			91
		],
		"session_id": 38320,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5681
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10756,
		"description": "",
		"latitude": 50.947685,
		"longitude": 3.129758,
		"shape": null,
		"filename": "20180703-042512-38670.wav",
		"file": "https://prod.roundware.com/rwmedia/20180703-042512-38670.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-03T04:25:12.663073",
		"updated": "2018-07-03T04:25:12.663073",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.411,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.41,
		"tag_ids": [
			282
		],
		"session_id": 38670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5701
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10757,
		"description": "",
		"latitude": 38.041349,
		"longitude": 23.540203,
		"shape": null,
		"filename": "20180703-111947-38677.wav",
		"file": "https://prod.roundware.com/rwmedia/20180703-111947-38677.wav",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-03T11:19:47.825033",
		"updated": "2018-07-03T11:19:47.825033",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.851,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.85,
		"tag_ids": [
			281
		],
		"session_id": 38677,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5702
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10761,
		"description": "",
		"latitude": 50.946699,
		"longitude": 3.117561,
		"shape": null,
		"filename": "20180705-080803-38740.wav",
		"file": "https://prod.roundware.com/rwmedia/20180705-080803-38740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-05T08:08:03.995895",
		"updated": "2018-07-05T08:08:03.995895",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.681,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.68,
		"tag_ids": [
			281
		],
		"session_id": 38740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5707
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10765,
		"description": "",
		"latitude": 50.947346,
		"longitude": 3.117199,
		"shape": null,
		"filename": "20180705-082245-38740.wav",
		"file": "https://prod.roundware.com/rwmedia/20180705-082245-38740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-05T08:22:45.915389",
		"updated": "2018-07-05T08:22:45.915389",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.43,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.43,
		"tag_ids": [
			282
		],
		"session_id": 38740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5709
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10767,
		"description": "",
		"latitude": 50.947351,
		"longitude": 3.117164,
		"shape": null,
		"filename": "20180705-082608-38740.wav",
		"file": "https://prod.roundware.com/rwmedia/20180705-082608-38740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-05T08:26:08.280986",
		"updated": "2018-07-05T08:26:08.280986",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.018,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.02,
		"tag_ids": [
			281
		],
		"session_id": 38740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5710
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10769,
		"description": "",
		"latitude": 50.949143,
		"longitude": 3.116969,
		"shape": null,
		"filename": "20180705-083527-38740.wav",
		"file": "https://prod.roundware.com/rwmedia/20180705-083527-38740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-05T08:35:27.473966",
		"updated": "2018-07-05T08:35:27.473966",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.947,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.95,
		"tag_ids": [
			281
		],
		"session_id": 38740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5711
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10776,
		"description": "",
		"latitude": 34.0348930358887,
		"longitude": -118.480621337891,
		"shape": null,
		"filename": "20180709-022317-38810.wav",
		"file": "https://prod.roundware.com/rwmedia/20180709-022317-38810.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-09T02:23:17.282756",
		"updated": "2018-07-09T02:23:17.282756",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.052,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.05,
		"tag_ids": [
			281
		],
		"session_id": 38810,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5718
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10778,
		"description": "",
		"latitude": 34.0348701477051,
		"longitude": -118.48063659668,
		"shape": null,
		"filename": "20180709-022529-38810.wav",
		"file": "https://prod.roundware.com/rwmedia/20180709-022529-38810.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-09T02:25:30.025034",
		"updated": "2018-07-09T02:25:30.025034",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.972,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.97,
		"tag_ids": [
			91
		],
		"session_id": 38810,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5719
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10798,
		"description": "",
		"latitude": 50.9471244812012,
		"longitude": 3.14063572883606,
		"shape": null,
		"filename": "20180719-072729-39042.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-072729-39042.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T07:27:29.860795",
		"updated": "2018-07-19T07:27:29.860795",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.479,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.48,
		"tag_ids": [
			282
		],
		"session_id": 39042,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5740
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10799,
		"description": "",
		"latitude": 50.944438,
		"longitude": 3.12699,
		"shape": null,
		"filename": "20180719-075924-39044.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-075924-39044.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T07:59:24.403030",
		"updated": "2018-07-19T07:59:24.403030",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.458,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.46,
		"tag_ids": [
			282
		],
		"session_id": 39044,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5741
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10800,
		"description": "",
		"latitude": 50.943515,
		"longitude": 3.124426,
		"shape": null,
		"filename": "20180719-081259-39047.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-081259-39047.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:13:00.012558",
		"updated": "2018-07-19T08:13:00.012558",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.99,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.99,
		"tag_ids": [
			282
		],
		"session_id": 39047,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5742
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10801,
		"description": "",
		"latitude": 50.943977,
		"longitude": 3.123319,
		"shape": null,
		"filename": "20180719-081829-39049.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-081829-39049.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:18:29.991915",
		"updated": "2018-07-19T08:18:29.991915",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.712,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.71,
		"tag_ids": [
			282
		],
		"session_id": 39049,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5743
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10802,
		"description": "",
		"latitude": 50.944697,
		"longitude": 3.124756,
		"shape": null,
		"filename": "20180719-082534-39052.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-082534-39052.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:25:35.147178",
		"updated": "2018-07-19T08:25:35.147178",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.795,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.79,
		"tag_ids": [
			282
		],
		"session_id": 39052,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5744
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10803,
		"description": "",
		"latitude": 50.944854,
		"longitude": 3.124801,
		"shape": null,
		"filename": "20180719-083301-39053.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-083301-39053.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:33:01.849004",
		"updated": "2018-07-19T08:33:01.849004",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.504,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.5,
		"tag_ids": [
			282
		],
		"session_id": 39053,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5745
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10804,
		"description": "",
		"latitude": 50.944492,
		"longitude": 3.125159,
		"shape": null,
		"filename": "20180719-083836-39055.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-083836-39055.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:38:36.286057",
		"updated": "2018-07-19T08:38:36.286057",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.061,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.06,
		"tag_ids": [
			282
		],
		"session_id": 39055,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5746
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10805,
		"description": "",
		"latitude": 50.945231,
		"longitude": 3.124151,
		"shape": null,
		"filename": "20180719-084330-39056.wav",
		"file": "https://prod.roundware.com/rwmedia/20180719-084330-39056.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-19T08:43:30.151624",
		"updated": "2018-07-19T08:43:30.151624",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.548,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.55,
		"tag_ids": [
			282
		],
		"session_id": 39056,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5747
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10809,
		"description": "",
		"latitude": 39.6672931,
		"longitude": 20.8510767,
		"shape": null,
		"filename": "20180720-153201-39087.wav",
		"file": "https://prod.roundware.com/rwmedia/20180720-153201-39087.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-20T15:32:01.771911",
		"updated": "2018-07-20T15:32:01.771911",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.157,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.16,
		"tag_ids": [],
		"session_id": 39087,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5751
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10874,
		"description": "",
		"latitude": 50.944171,
		"longitude": 3.125159,
		"shape": null,
		"filename": "20180725-034730-39240.wav",
		"file": "https://prod.roundware.com/rwmedia/20180725-034730-39240.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-07-25T03:47:30.732484",
		"updated": "2018-07-25T03:47:30.732484",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.783,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.78,
		"tag_ids": [
			281
		],
		"session_id": 39240,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5798
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10887,
		"description": "Speelplein, speelpleintje, lievevrouw, plein, olv, kippen,",
		"latitude": 50.948101,
		"longitude": 3.135611,
		"shape": null,
		"filename": "20180804-022501-39472.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-022501-39472.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:25:01.349714",
		"updated": "2018-08-04T02:25:01.349714",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.798,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.8,
		"tag_ids": [
			281
		],
		"session_id": 39472,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5813
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10888,
		"description": "",
		"latitude": 50.947089,
		"longitude": 3.133781,
		"shape": null,
		"filename": "20180804-023015-39472.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-023015-39472.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:30:15.783127",
		"updated": "2018-08-04T02:30:15.783127",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.247,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.25,
		"tag_ids": [
			281
		],
		"session_id": 39472,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5814
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10889,
		"description": "",
		"latitude": 50.947793,
		"longitude": 3.13292,
		"shape": null,
		"filename": "20180804-023407-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-023407-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:34:08.088250",
		"updated": "2018-08-04T02:34:08.088250",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.39,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.39,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5815
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10890,
		"description": "",
		"latitude": 50.948739,
		"longitude": 3.131196,
		"shape": null,
		"filename": "20180804-023752-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-023752-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:37:52.256683",
		"updated": "2018-08-04T02:37:52.256683",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.405,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.4,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5816
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10895,
		"description": "",
		"latitude": 50.948644,
		"longitude": 3.130801,
		"shape": null,
		"filename": "20180804-024644-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-024644-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:46:44.209795",
		"updated": "2018-08-04T02:46:44.209795",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.08,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.08,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5820
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10896,
		"description": "",
		"latitude": 50.948978,
		"longitude": 3.130574,
		"shape": null,
		"filename": "20180804-024904-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-024904-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:49:04.198590",
		"updated": "2018-08-04T02:49:04.198590",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.291,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.29,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5821
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10897,
		"description": "",
		"latitude": 50.948804,
		"longitude": 3.129867,
		"shape": null,
		"filename": "20180804-025158-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-025158-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T02:51:58.977937",
		"updated": "2018-08-04T02:51:58.977937",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5822
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10900,
		"description": "",
		"latitude": 50.947571,
		"longitude": 3.12962,
		"shape": null,
		"filename": "20180804-030627-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-030627-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:06:27.465836",
		"updated": "2018-08-04T03:06:27.465836",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.223,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 21.22,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5825
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10901,
		"description": "",
		"latitude": 50.947524,
		"longitude": 3.129154,
		"shape": null,
		"filename": "20180804-030818-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-030818-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:08:19.022514",
		"updated": "2018-08-04T03:08:19.022514",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.832,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.83,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5826
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10902,
		"description": "",
		"latitude": 50.947339,
		"longitude": 3.128605,
		"shape": null,
		"filename": "20180804-031017-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-031017-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:10:17.955817",
		"updated": "2018-08-04T03:10:17.955817",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.083,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.08,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5827
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10903,
		"description": "",
		"latitude": 50.946998,
		"longitude": 3.127663,
		"shape": null,
		"filename": "20180804-031230-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-031230-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:12:30.795476",
		"updated": "2018-08-04T03:12:30.795476",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.972,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.97,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5828
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10904,
		"description": "",
		"latitude": 50.946515,
		"longitude": 3.126595,
		"shape": null,
		"filename": "20180804-031511-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-031511-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:15:12.020086",
		"updated": "2018-08-04T03:15:12.020086",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.693,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.69,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5829
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10905,
		"description": "",
		"latitude": 50.946391,
		"longitude": 3.126482,
		"shape": null,
		"filename": "20180804-031621-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-031621-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:16:22.040534",
		"updated": "2018-08-04T03:16:22.040534",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.554,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.55,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5830
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10906,
		"description": "",
		"latitude": 50.946177,
		"longitude": 3.125975,
		"shape": null,
		"filename": "20180804-031856-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-031856-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:18:56.197637",
		"updated": "2018-08-04T03:18:56.197637",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.148,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.15,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5831
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10907,
		"description": "",
		"latitude": 50.945964,
		"longitude": 3.125589,
		"shape": null,
		"filename": "20180804-032040-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-032040-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:20:40.847919",
		"updated": "2018-08-04T03:20:40.847919",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.275,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.27,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5832
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10908,
		"description": "",
		"latitude": 50.9456596374512,
		"longitude": 3.12488436698914,
		"shape": null,
		"filename": "20180804-032232-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-032232-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:22:32.857536",
		"updated": "2018-08-04T03:22:32.857536",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.715,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.71,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5833
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 10909,
		"description": "Grotemarkt hoek ooststraat",
		"latitude": 50.945404,
		"longitude": 3.124311,
		"shape": null,
		"filename": "20180804-032424-39473.wav",
		"file": "https://prod.roundware.com/rwmedia/20180804-032424-39473.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-04T03:24:25.031360",
		"updated": "2018-08-04T03:24:25.031360",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			281
		],
		"session_id": 39473,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5834
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11157,
		"description": "",
		"latitude": 32.239559173584,
		"longitude": 76.3134384155273,
		"shape": null,
		"filename": "20180824-131933-39797.wav",
		"file": "https://prod.roundware.com/rwmedia/20180824-131933-39797.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-24T13:19:34.431560",
		"updated": "2018-08-24T13:19:34.431560",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.142,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 43.14,
		"tag_ids": [
			282
		],
		"session_id": 39797,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5855
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11158,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932640075684,
		"shape": null,
		"filename": "20180825-001759-39813.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-001759-39813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:17:59.923643",
		"updated": "2018-08-25T00:17:59.923643",
		"weight": 50,
		"start_time": 0,
		"end_time": 58.328,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 58.33,
		"tag_ids": [
			92
		],
		"session_id": 39813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5856
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11159,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932678222656,
		"shape": null,
		"filename": "20180825-003559-39816.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-003559-39816.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:36:00.242719",
		"updated": "2018-08-25T00:36:00.242719",
		"weight": 50,
		"start_time": 0,
		"end_time": 22.105,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 22.11,
		"tag_ids": [
			282
		],
		"session_id": 39816,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5857
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11160,
		"description": "",
		"latitude": 40.9946136474609,
		"longitude": -111.932670593262,
		"shape": null,
		"filename": "20180825-003838-39817.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-003838-39817.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:38:38.915912",
		"updated": "2018-08-25T00:38:38.915912",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.538,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.54,
		"tag_ids": [
			282
		],
		"session_id": 39817,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5858
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11161,
		"description": "",
		"latitude": 40.9946060180664,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20180825-004109-39818.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-004109-39818.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:41:09.370128",
		"updated": "2018-08-25T00:41:09.370128",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.071,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.07,
		"tag_ids": [
			282
		],
		"session_id": 39818,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5859
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11162,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20180825-004249-39819.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-004249-39819.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:42:49.992930",
		"updated": "2018-08-25T00:42:49.992930",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.851,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.85,
		"tag_ids": [
			282
		],
		"session_id": 39819,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5860
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11163,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932670593262,
		"shape": null,
		"filename": "20180825-004540-39820.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-004540-39820.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:45:41.164418",
		"updated": "2018-08-25T00:45:41.164418",
		"weight": 50,
		"start_time": 0,
		"end_time": 37.105,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 37.1,
		"tag_ids": [
			282
		],
		"session_id": 39820,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5861
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11164,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932647705078,
		"shape": null,
		"filename": "20180825-004808-39821.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-004808-39821.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:48:08.645180",
		"updated": "2018-08-25T00:48:08.645180",
		"weight": 50,
		"start_time": 0,
		"end_time": 49.922,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 49.92,
		"tag_ids": [
			282
		],
		"session_id": 39821,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5862
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11165,
		"description": "",
		"latitude": 40.9946060180664,
		"longitude": -111.932647705078,
		"shape": null,
		"filename": "20180825-005105-39822.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-005105-39822.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:51:06.104068",
		"updated": "2018-08-25T00:51:06.104068",
		"weight": 50,
		"start_time": 0,
		"end_time": 59.35,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 59.35,
		"tag_ids": [
			282
		],
		"session_id": 39822,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5863
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11166,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20180825-005425-39823.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-005425-39823.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:54:25.386094",
		"updated": "2018-08-25T00:54:25.386094",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.492,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.49,
		"tag_ids": [
			282
		],
		"session_id": 39823,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5864
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11167,
		"description": "",
		"latitude": 40.9945755004883,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20180825-005545-39824.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-005545-39824.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:55:45.527949",
		"updated": "2018-08-25T00:55:45.527949",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.575,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.57,
		"tag_ids": [
			282
		],
		"session_id": 39824,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5865
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11168,
		"description": "",
		"latitude": 40.9945831298828,
		"longitude": -111.932678222656,
		"shape": null,
		"filename": "20180825-005821-39825.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-005821-39825.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T00:58:21.722965",
		"updated": "2018-08-25T00:58:21.722965",
		"weight": 50,
		"start_time": 0,
		"end_time": 50.991,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 50.99,
		"tag_ids": [
			282
		],
		"session_id": 39825,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5866
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11169,
		"description": "",
		"latitude": 40.9945793151855,
		"longitude": -111.932685852051,
		"shape": null,
		"filename": "20180825-010128-39826.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-010128-39826.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T01:01:28.644104",
		"updated": "2018-08-25T01:01:28.644104",
		"weight": 50,
		"start_time": 0,
		"end_time": 56.981,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 56.98,
		"tag_ids": [
			282
		],
		"session_id": 39826,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5867
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11172,
		"description": "",
		"latitude": 32.2395515441895,
		"longitude": 76.3134460449219,
		"shape": null,
		"filename": "20180825-021410-39828.wav",
		"file": "https://prod.roundware.com/rwmedia/20180825-021410-39828.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-08-25T02:14:10.952917",
		"updated": "2018-08-25T02:14:10.952917",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.449,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.45,
		"tag_ids": [
			91
		],
		"session_id": 39828,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5868
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11183,
		"description": "",
		"latitude": 37.8018646240234,
		"longitude": -122.397048950195,
		"shape": null,
		"filename": "20180906-164137-40052.wav",
		"file": "https://prod.roundware.com/rwmedia/20180906-164137-40052.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-06T16:41:37.903469",
		"updated": "2018-09-06T16:41:37.903469",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.03,
		"tag_ids": [
			289
		],
		"session_id": 40052,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5878
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11184,
		"description": "",
		"latitude": 37.801887512207,
		"longitude": -122.397048950195,
		"shape": null,
		"filename": "20180906-164737-40054.wav",
		"file": "https://prod.roundware.com/rwmedia/20180906-164737-40054.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-06T16:47:37.779576",
		"updated": "2018-09-06T16:47:37.779576",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.873,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.87,
		"tag_ids": [
			289
		],
		"session_id": 40054,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5879
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11186,
		"description": "",
		"latitude": 37.8018951416016,
		"longitude": -122.397041320801,
		"shape": null,
		"filename": "20180906-170144-40054.wav",
		"file": "https://prod.roundware.com/rwmedia/20180906-170144-40054.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-06T17:01:44.487929",
		"updated": "2018-09-06T17:01:44.487929",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.696,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.7,
		"tag_ids": [
			289
		],
		"session_id": 40054,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5880
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11188,
		"description": "",
		"latitude": 36.728099822998,
		"longitude": -118.146850585938,
		"shape": null,
		"filename": "20180909-131952-40081.wav",
		"file": "https://prod.roundware.com/rwmedia/20180909-131952-40081.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-09T13:19:53.331645",
		"updated": "2018-09-09T13:19:53.331645",
		"weight": 50,
		"start_time": 0,
		"end_time": 53.08,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 53.08,
		"tag_ids": [
			92
		],
		"session_id": 40081,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5882
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11189,
		"description": "",
		"latitude": 36.7284965515137,
		"longitude": -118.14762878418,
		"shape": null,
		"filename": "20180909-132431-40082.wav",
		"file": "https://prod.roundware.com/rwmedia/20180909-132431-40082.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-09T13:24:32.036102",
		"updated": "2018-09-09T13:24:32.036102",
		"weight": 50,
		"start_time": 0,
		"end_time": 33.994,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 33.99,
		"tag_ids": [
			92
		],
		"session_id": 40082,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5883
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11191,
		"description": "",
		"latitude": 36.7289505004883,
		"longitude": -118.147819519043,
		"shape": null,
		"filename": "20180909-132637-40082.wav",
		"file": "https://prod.roundware.com/rwmedia/20180909-132637-40082.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-09T13:26:37.922893",
		"updated": "2018-09-09T13:26:37.922893",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.123,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.12,
		"tag_ids": [
			91
		],
		"session_id": 40082,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5884
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11193,
		"description": "",
		"latitude": 36.7292442321777,
		"longitude": -118.148551940918,
		"shape": null,
		"filename": "20180909-133007-40082.wav",
		"file": "https://prod.roundware.com/rwmedia/20180909-133007-40082.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-09T13:30:08.069906",
		"updated": "2018-09-09T13:30:08.069906",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.077,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.08,
		"tag_ids": [
			92
		],
		"session_id": 40082,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5885
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11194,
		"description": "",
		"latitude": 36.729175567627,
		"longitude": -118.148780822754,
		"shape": null,
		"filename": "20180909-133239-40084.wav",
		"file": "https://prod.roundware.com/rwmedia/20180909-133239-40084.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-09-09T13:32:39.386846",
		"updated": "2018-09-09T13:32:39.386846",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.092,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.09,
		"tag_ids": [
			91,
			303
		],
		"session_id": 40084,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5886
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11218,
		"description": "",
		"latitude": 42.4995829761295,
		"longitude": -71.2734526768327,
		"shape": null,
		"filename": "20181004-101017-40506.wav",
		"file": "https://prod.roundware.com/rwmedia/20181004-101017-40506.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-04T10:10:17.450337",
		"updated": "2018-10-04T10:10:17.450337",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.544,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.54,
		"tag_ids": [
			91,
			303
		],
		"session_id": 40506,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5912
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11219,
		"description": "",
		"latitude": 42.4986945838132,
		"longitude": -71.2808977347531,
		"shape": null,
		"filename": "20181004-101335-40509.wav",
		"file": "https://prod.roundware.com/rwmedia/20181004-101335-40509.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-04T10:13:35.570926",
		"updated": "2018-10-04T10:13:35.570926",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.296,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 23.3,
		"tag_ids": [],
		"session_id": 40509,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5913
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11245,
		"description": "",
		"latitude": 42.4985134,
		"longitude": -71.2810193,
		"shape": null,
		"filename": "20181017-124059-40807.wav",
		"file": "https://prod.roundware.com/rwmedia/20181017-124059-40807.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-17T12:41:00.234671",
		"updated": "2018-10-17T12:41:00.234671",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.337,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.34,
		"tag_ids": [],
		"session_id": 40807,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5943
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11246,
		"description": "",
		"latitude": 42.498433290038,
		"longitude": -71.2809232783812,
		"shape": null,
		"filename": "20181017-125854-40812.wav",
		"file": "https://prod.roundware.com/rwmedia/20181017-125854-40812.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-17T12:58:54.526726",
		"updated": "2018-10-17T12:58:54.526726",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.984,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.98,
		"tag_ids": [],
		"session_id": 40812,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5944
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11247,
		"description": "",
		"latitude": 42.4986227089935,
		"longitude": -71.2810781971284,
		"shape": null,
		"filename": "20181017-130900-40815.wav",
		"file": "https://prod.roundware.com/rwmedia/20181017-130900-40815.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-17T13:09:00.581383",
		"updated": "2018-10-17T13:09:00.581383",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.152,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.15,
		"tag_ids": [],
		"session_id": 40815,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5945
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11248,
		"description": "",
		"latitude": 42.4988087034249,
		"longitude": -71.2812181749114,
		"shape": null,
		"filename": "20181017-141354-40817.wav",
		"file": "https://prod.roundware.com/rwmedia/20181017-141354-40817.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-10-17T14:13:54.842632",
		"updated": "2018-10-17T14:13:54.842632",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.701,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.7,
		"tag_ids": [],
		"session_id": 40817,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5946
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11273,
		"description": "",
		"latitude": 42.4986605113768,
		"longitude": -71.2808520533808,
		"shape": null,
		"filename": "20181106-143553-41155.wav",
		"file": "https://prod.roundware.com/rwmedia/20181106-143553-41155.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-06T14:35:53.616907",
		"updated": "2018-11-06T14:35:53.616907",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.557,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.56,
		"tag_ids": [],
		"session_id": 41155,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5973
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11274,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20181107-134848-41183.wav",
		"file": "https://prod.roundware.com/rwmedia/20181107-134848-41183.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-07T13:48:48.596864",
		"updated": "2018-11-07T13:48:48.596864",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.216,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.22,
		"tag_ids": [
			91
		],
		"session_id": 41183,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5974
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11297,
		"description": "",
		"latitude": 42.3020106478336,
		"longitude": -71.4779400173575,
		"shape": null,
		"filename": "20181126-121819-41497.wav",
		"file": "https://prod.roundware.com/rwmedia/20181126-121819-41497.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-26T12:18:20.131039",
		"updated": "2018-11-26T12:18:20.131039",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.616,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.62,
		"tag_ids": [
			91
		],
		"session_id": 41497,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5996
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11300,
		"description": "",
		"latitude": 42.3018480252437,
		"longitude": -71.4769139100342,
		"shape": null,
		"filename": "20181128-155822-41533.wav",
		"file": "https://prod.roundware.com/rwmedia/20181128-155822-41533.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-28T15:58:23.434551",
		"updated": "2018-11-28T15:58:23.434551",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.467,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.47,
		"tag_ids": [
			91
		],
		"session_id": 41533,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			5999
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11306,
		"description": "",
		"latitude": 42.3012275695801,
		"longitude": -71.4762649536133,
		"shape": null,
		"filename": "20181129-093306-41554.wav",
		"file": "https://prod.roundware.com/rwmedia/20181129-093306-41554.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-29T09:33:06.541688",
		"updated": "2018-11-29T09:33:06.541688",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.86,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.86,
		"tag_ids": [
			91
		],
		"session_id": 41554,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6005
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11308,
		"description": "",
		"latitude": 42.3015403747559,
		"longitude": -71.476188659668,
		"shape": null,
		"filename": "20181129-095649-41555.wav",
		"file": "https://prod.roundware.com/rwmedia/20181129-095649-41555.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-29T09:56:49.594638",
		"updated": "2018-11-29T09:56:49.594638",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.102,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.1,
		"tag_ids": [
			218
		],
		"session_id": 41555,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6006
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11309,
		"description": "",
		"latitude": 31.4724140167236,
		"longitude": -100.434036254883,
		"shape": null,
		"filename": "20181130-154639-41573.wav",
		"file": "https://prod.roundware.com/rwmedia/20181130-154639-41573.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-11-30T15:46:40.182081",
		"updated": "2018-11-30T15:46:40.182081",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.944,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.94,
		"tag_ids": [
			218
		],
		"session_id": 41573,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6007
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11323,
		"description": "",
		"latitude": 42.2982771074503,
		"longitude": -71.4678587723999,
		"shape": null,
		"filename": "20181210-124030-41708.wav",
		"file": "https://prod.roundware.com/rwmedia/20181210-124030-41708.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-10T12:40:30.437525",
		"updated": "2018-12-10T12:40:30.437525",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.944,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.94,
		"tag_ids": [
			92
		],
		"session_id": 41708,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6021
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11331,
		"description": "",
		"latitude": 42.3008640592202,
		"longitude": -71.4774074364929,
		"shape": null,
		"filename": "20181215-225531-41786.wav",
		"file": "https://prod.roundware.com/rwmedia/20181215-225531-41786.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-15T22:55:31.920378",
		"updated": "2018-12-15T22:55:31.920378",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.436,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.44,
		"tag_ids": [
			92
		],
		"session_id": 41786,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6029
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11332,
		"description": "",
		"latitude": 42.498510797598,
		"longitude": -71.2808600999415,
		"shape": null,
		"filename": "20181216-233941-41801.wav",
		"file": "https://prod.roundware.com/rwmedia/20181216-233941-41801.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-16T23:39:42.011165",
		"updated": "2018-12-16T23:39:42.011165",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.551,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.55,
		"tag_ids": [
			92
		],
		"session_id": 41801,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6030
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11334,
		"description": "",
		"latitude": 42.3024063110352,
		"longitude": -71.4762649536133,
		"shape": null,
		"filename": "20181217-113206-41811.wav",
		"file": "https://prod.roundware.com/rwmedia/20181217-113206-41811.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-17T11:32:06.671014",
		"updated": "2018-12-17T11:32:06.671014",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.749,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.75,
		"tag_ids": [
			91
		],
		"session_id": 41811,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6031
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11335,
		"description": "",
		"latitude": 42.4986504111835,
		"longitude": -71.2809227966436,
		"shape": null,
		"filename": "20181217-154152-41819.wav",
		"file": "https://prod.roundware.com/rwmedia/20181217-154152-41819.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-17T15:41:52.522712",
		"updated": "2018-12-17T15:41:52.522712",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.013,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.01,
		"tag_ids": [
			91
		],
		"session_id": 41819,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6032
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11357,
		"description": "",
		"latitude": 35.4778938293457,
		"longitude": 140.044723510742,
		"shape": null,
		"filename": "20181228-203607-42009.wav",
		"file": "https://prod.roundware.com/rwmedia/20181228-203607-42009.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2018-12-28T20:36:08.110485",
		"updated": "2018-12-28T20:36:08.110485",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.6,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.6,
		"tag_ids": [
			91
		],
		"session_id": 42009,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6055
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11403,
		"description": "",
		"latitude": 42.4983215332031,
		"longitude": -71.281005859375,
		"shape": null,
		"filename": "20190125-092502-42529.wav",
		"file": "https://prod.roundware.com/rwmedia/20190125-092502-42529.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-01-25T09:25:03.536924",
		"updated": "2019-01-25T09:25:03.536924",
		"weight": 50,
		"start_time": 0,
		"end_time": 32.972,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 32.97,
		"tag_ids": [
			281
		],
		"session_id": 42529,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6103
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11419,
		"description": "",
		"latitude": 42.3607444763184,
		"longitude": -71.0880126953125,
		"shape": null,
		"filename": "20190202-113036-42725.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-113036-42725.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:30:37.266846",
		"updated": "2019-02-02T11:30:37.266846",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.541,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.54,
		"tag_ids": [
			91
		],
		"session_id": 42725,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6119
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11421,
		"description": "",
		"latitude": 42.360595703125,
		"longitude": -71.0879364013672,
		"shape": null,
		"filename": "20190202-113557-42740.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-113557-42740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:35:58.587700",
		"updated": "2019-02-02T11:35:58.587700",
		"weight": 50,
		"start_time": 0,
		"end_time": 44.442,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 44.44,
		"tag_ids": [
			91
		],
		"session_id": 42740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6120
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11422,
		"description": "",
		"latitude": 42.3607444763184,
		"longitude": -71.0878143310547,
		"shape": null,
		"filename": "20190202-113819-42745.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-113819-42745.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:38:20.432561",
		"updated": "2019-02-02T11:38:20.432561",
		"weight": 50,
		"start_time": 0,
		"end_time": 45.65,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 45.65,
		"tag_ids": [
			92
		],
		"session_id": 42745,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6121
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11424,
		"description": "",
		"latitude": 42.3604507446289,
		"longitude": -71.0874710083008,
		"shape": null,
		"filename": "20190202-113831-42740.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-113831-42740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:38:32.351314",
		"updated": "2019-02-02T11:38:32.351314",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.14,
		"tag_ids": [
			91
		],
		"session_id": 42740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6122
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11426,
		"description": "",
		"latitude": 42.3603668212891,
		"longitude": -71.0875244140625,
		"shape": null,
		"filename": "20190202-113941-42740.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-113941-42740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:39:42.548665",
		"updated": "2019-02-02T11:39:42.548665",
		"weight": 50,
		"start_time": 0,
		"end_time": 49.597,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 49.6,
		"tag_ids": [
			91,
			302
		],
		"session_id": 42740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6123
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11430,
		"description": "",
		"latitude": 42.3603820800781,
		"longitude": -71.087532043457,
		"shape": null,
		"filename": "20190202-114052-42740.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114052-42740.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:40:52.573692",
		"updated": "2019-02-02T11:40:52.573692",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.87,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 23.87,
		"tag_ids": [
			91
		],
		"session_id": 42740,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6125
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11431,
		"description": "",
		"latitude": 42.3606834411621,
		"longitude": -71.0877914428711,
		"shape": null,
		"filename": "20190202-114053-42745.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114053-42745.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:40:54.558443",
		"updated": "2019-02-02T11:40:54.558443",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.727,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.73,
		"tag_ids": [
			92
		],
		"session_id": 42745,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6124
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11433,
		"description": "",
		"latitude": 42.3605422973633,
		"longitude": -71.0874786376953,
		"shape": null,
		"filename": "20190202-114220-42748.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114220-42748.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:42:20.832483",
		"updated": "2019-02-02T11:42:20.832483",
		"weight": 50,
		"start_time": 0,
		"end_time": 40.96,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 40.96,
		"tag_ids": [
			91
		],
		"session_id": 42748,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6126
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11434,
		"description": "",
		"latitude": 42.3606071472168,
		"longitude": -71.0874633789062,
		"shape": null,
		"filename": "20190202-114357-42749.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114357-42749.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:43:58.404056",
		"updated": "2019-02-02T11:43:58.404056",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			91
		],
		"session_id": 42749,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6127
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11435,
		"description": "",
		"latitude": 42.3603744506836,
		"longitude": -71.0874633789062,
		"shape": null,
		"filename": "20190202-114418-42747.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114418-42747.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:44:19.752344",
		"updated": "2019-02-02T11:44:19.752344",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			218,
			303
		],
		"session_id": 42747,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6128
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11438,
		"description": "",
		"latitude": 42.3604850769043,
		"longitude": -71.0875473022461,
		"shape": null,
		"filename": "20190202-114447-42748.wav",
		"file": "https://prod.roundware.com/rwmedia/20190202-114447-42748.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-02T11:44:48.186415",
		"updated": "2019-02-02T11:44:48.186415",
		"weight": 50,
		"start_time": 0,
		"end_time": 60.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 60.14,
		"tag_ids": [
			92,
			302
		],
		"session_id": 42748,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6129
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11478,
		"description": "",
		"latitude": 9.93959140777588,
		"longitude": -84.1458587646484,
		"shape": null,
		"filename": "20190219-155244-43347.wav",
		"file": "https://prod.roundware.com/rwmedia/20190219-155244-43347.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-19T15:52:45.492778",
		"updated": "2019-02-19T15:52:45.492778",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.442,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 14.44,
		"tag_ids": [
			282
		],
		"session_id": 43347,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6171
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11480,
		"description": "",
		"latitude": 9.93953704833984,
		"longitude": -84.1459426879883,
		"shape": null,
		"filename": "20190219-155647-43348.wav",
		"file": "https://prod.roundware.com/rwmedia/20190219-155647-43348.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-02-19T15:56:47.728969",
		"updated": "2019-02-19T15:56:47.728969",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.028,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 27.03,
		"tag_ids": [
			91
		],
		"session_id": 43348,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6172
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11544,
		"description": "",
		"latitude": 50.94906,
		"longitude": 3.138219,
		"shape": null,
		"filename": "20190410-081159-44105.wav",
		"file": "https://prod.roundware.com/rwmedia/20190410-081159-44105.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-10T08:12:00.435284",
		"updated": "2019-04-10T08:12:00.435284",
		"weight": 60,
		"start_time": 0,
		"end_time": 19.04,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.04,
		"tag_ids": [
			281
		],
		"session_id": 44105,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6236
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11547,
		"description": "olv, tafeltje, stoelen, lievevrouwplei,Roeselae, grasplein,",
		"latitude": 50.948151,
		"longitude": 3.135099,
		"shape": null,
		"filename": "20190411-080250-44133.wav",
		"file": "https://prod.roundware.com/rwmedia/20190411-080250-44133.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-11T08:02:51.576585",
		"updated": "2019-04-11T08:02:51.576585",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.201,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.2,
		"tag_ids": [
			281
		],
		"session_id": 44133,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6238
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11548,
		"description": "",
		"latitude": 50.948509,
		"longitude": 3.136351,
		"shape": null,
		"filename": "20190411-082935-44141.wav",
		"file": "https://prod.roundware.com/rwmedia/20190411-082935-44141.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-11T08:29:35.825378",
		"updated": "2019-04-11T08:29:35.825378",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.387,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.39,
		"tag_ids": [
			281
		],
		"session_id": 44141,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6239
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11549,
		"description": "",
		"latitude": 50.946051,
		"longitude": 3.139057,
		"shape": null,
		"filename": "20190415-122930-44220.wav",
		"file": "https://prod.roundware.com/rwmedia/20190415-122930-44220.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-15T12:29:30.346658",
		"updated": "2019-04-15T12:29:30.346658",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.876,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.88,
		"tag_ids": [
			281
		],
		"session_id": 44220,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6240
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11550,
		"description": "",
		"latitude": 50.945989,
		"longitude": 3.137759,
		"shape": null,
		"filename": "20190415-123834-44223.wav",
		"file": "https://prod.roundware.com/rwmedia/20190415-123834-44223.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-15T12:38:34.220470",
		"updated": "2019-04-15T12:38:34.220470",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.037,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.04,
		"tag_ids": [
			281
		],
		"session_id": 44223,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6241
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11551,
		"description": "El Dia \r\nStationsplein 25 \r\n8800 Roeselare",
		"latitude": 50.949121,
		"longitude": 3.129611,
		"shape": null,
		"filename": "20190418-075138-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075138-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:51:38.928573",
		"updated": "2019-04-18T07:51:38.928573",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.879,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.88,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6242
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11552,
		"description": "Mahran Pitta  \r\nStationsplein 21\r\n8800 Roeselare",
		"latitude": 50.948971,
		"longitude": 3.129651,
		"shape": null,
		"filename": "20190418-075316-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075316-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:53:17.143735",
		"updated": "2019-04-18T07:53:17.143735",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.922,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.92,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6243
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11553,
		"description": "Frituur van halleke  \r\nStationsplein 20 \r\n8800 Roeselare",
		"latitude": 50.94889,
		"longitude": 3.129651,
		"shape": null,
		"filename": "20190418-075502-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075502-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:55:02.266990",
		"updated": "2019-04-18T07:55:02.266990",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.848,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.85,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6244
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11554,
		"description": "Flandria supermarkt danken?\r\nStationsplein 19 \r\n8800 Roeselare",
		"latitude": 50.948841,
		"longitude": 3.129651,
		"shape": null,
		"filename": "20190418-075612-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075612-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:56:12.767104",
		"updated": "2019-04-18T07:56:12.767104",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6245
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11555,
		"description": "Popcorn Music\r\nStationsplein 18 \r\n 8800 Roeselae\r\n051 20 43 73",
		"latitude": 50.948821,
		"longitude": 3.129651,
		"shape": null,
		"filename": "20190418-075728-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075728-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:57:29.167816",
		"updated": "2019-04-18T07:57:29.167816",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.495,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.49,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6246
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11556,
		"description": "Au Damier \r\nStationsplein 13 \r\n8800 Roeselare\r\n051 24 44 21",
		"latitude": 50.948599,
		"longitude": 3.129791,
		"shape": null,
		"filename": "20190418-075907-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-075907-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T07:59:07.325377",
		"updated": "2019-04-18T07:59:07.325377",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.87,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.87,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6247
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11558,
		"description": "Tratoria Pizza \r\nStationsplein 9  \r\n8800 Roeselare",
		"latitude": 50.948099,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-080326-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-080326-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:03:26.297230",
		"updated": "2019-04-18T08:03:26.297230",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.501,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.5,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6249
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11559,
		"description": "Parkhotel \r\nStatonsplein 7\r\n8800 Roeselare\r\n051 26 31 31",
		"latitude": 50.948097,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-080627-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-080627-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:06:28.109931",
		"updated": "2019-04-18T08:06:28.109931",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.037,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.04,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6250
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11560,
		"description": "Pastini \r\nStationsplein 6 \r\n8800 Roeselare\r\n051 80 22 18",
		"latitude": 50.948039,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-080723-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-080723-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:07:24.068327",
		"updated": "2019-04-18T08:07:24.068327",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.337,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.34,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6251
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11561,
		"description": "Bistro Belle Vue   \r\nStationsplein  5 \r\n8800 Roeselare",
		"latitude": 50.94799,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-080847-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-080847-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:08:47.965864",
		"updated": "2019-04-18T08:08:47.965864",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.758,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.76,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6252
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11562,
		"description": "Petrouska \r\nStationsplein 4 \r\n8800 Roeselare\r\n051 20 e 25 95",
		"latitude": 50.947931,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-080937-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-080937-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:09:37.229395",
		"updated": "2019-04-18T08:09:37.229395",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.359,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.36,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6253
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11563,
		"description": "Café St George\r\nStationsplein 3 \r\n 8800 Roeselare\r\n0472 29 27 55",
		"latitude": 50.947851,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-081142-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081142-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:11:43.061734",
		"updated": "2019-04-18T08:11:43.061734",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.69,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.69,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6254
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11564,
		"description": "In Den Trap \r\n Stationsplein 2\r\n8800 Roeselare\r\n051 20 02 49",
		"latitude": 50.947821,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-081252-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081252-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:12:52.999311",
		"updated": "2019-04-18T08:12:52.999311",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.176,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.18,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6255
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11565,
		"description": "In den eekhoorn \r\nStationsplein 1\r\n8800 Roeselare\r\n051 22 06 07",
		"latitude": 50.947691,
		"longitude": 3.129931,
		"shape": null,
		"filename": "20190418-081403-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081403-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:14:03.196420",
		"updated": "2019-04-18T08:14:03.196420",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.755,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.75,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6256
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11566,
		"description": "Supermakrt Asalam \r\n146 stationsplein \r\n8800 Roeselae",
		"latitude": 50.9473706,
		"longitude": 3.1302031,
		"shape": null,
		"filename": "20190418-081719-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081719-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:17:19.224295",
		"updated": "2019-04-18T08:17:19.224295",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.684,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.68,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6257
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11567,
		"description": "Ooststraat 144 Kruidvat  03 303 01 36",
		"latitude": 50.9474999,
		"longitude": 3.1298099,
		"shape": null,
		"filename": "20190418-081807-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081807-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:18:08.152370",
		"updated": "2019-04-18T08:18:08.152370",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.938,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.94,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6258
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11568,
		"description": "Esprit\r\nOoststraat 140 - 142 \r\n8800 Roeselae\r\n051 24 23 85",
		"latitude": 50.947511,
		"longitude": 3.129537,
		"shape": null,
		"filename": "20190418-081931-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-081931-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:19:32.075191",
		"updated": "2019-04-18T08:19:32.075191",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.247,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.25,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6259
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11569,
		"description": "New look \r\nOoststraat 138 \r\n8800 Roeselare\r\n051 20 30 59",
		"latitude": 50.947511,
		"longitude": 3.129432,
		"shape": null,
		"filename": "20190418-082034-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-082034-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:20:35.055423",
		"updated": "2019-04-18T08:20:35.055423",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.154,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.15,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6260
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11570,
		"description": "Margaux \r\nOoststraat 134 \r\n051 24 00 42",
		"latitude": 50.947463,
		"longitude": 3.129261,
		"shape": null,
		"filename": "20190418-082212-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-082212-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:22:13.149182",
		"updated": "2019-04-18T08:22:13.149182",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.712,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.71,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6261
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11571,
		"description": "Pastel   \r\nOoststraat 128 \r\n8800 Roeselare",
		"latitude": 50.947427,
		"longitude": 3.129099,
		"shape": null,
		"filename": "20190418-083050-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083050-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:30:51.155548",
		"updated": "2019-04-18T08:30:51.155548",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.26,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.26,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6262
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11572,
		"description": "Yves Rocher \r\nOoststraat 124 \r\n8800 Roeselare\r\n051 24 76 35",
		"latitude": 50.947387,
		"longitude": 3.128843,
		"shape": null,
		"filename": "20190418-083325-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083325-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:33:25.144576",
		"updated": "2019-04-18T08:33:25.144576",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.783,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.78,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6263
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11573,
		"description": "Tommy Hilfiger Store \r\nOoststraat 120 \r\n8800 Roeselare\r\n051 21 29 00",
		"latitude": 50.947394,
		"longitude": 3.128739,
		"shape": null,
		"filename": "20190418-083435-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083435-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:34:35.219600",
		"updated": "2019-04-18T08:34:35.219600",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.315,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.32,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6264
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11574,
		"description": "Brasserie de Koornbloem \r\nOoststraat 118 \r\n8800 Roeselare\r\n051 20 18 52",
		"latitude": 50.947359,
		"longitude": 3.128591,
		"shape": null,
		"filename": "20190418-083524-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083524-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:35:24.415542",
		"updated": "2019-04-18T08:35:24.415542",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.662,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.66,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6265
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11575,
		"description": "Outlet Rigi  \r\nOoststraat 114 \r\n8800 Roeselare",
		"latitude": 50.947291,
		"longitude": 3.128521,
		"shape": null,
		"filename": "20190418-083641-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083641-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:36:41.219167",
		"updated": "2019-04-18T08:36:41.219167",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.64,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.64,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6266
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11576,
		"description": "Street One \r\nOoststraat 112 \r\n8800 Roeselae\r\n051 20 27 95",
		"latitude": 50.947233,
		"longitude": 3.128404,
		"shape": null,
		"filename": "20190418-083826-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-083826-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:38:26.265388",
		"updated": "2019-04-18T08:38:26.265388",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.337,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.34,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6267
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11577,
		"description": "Gabri We \r\nOoststraat 106 \r\n8800 Roeselare",
		"latitude": 50.947175,
		"longitude": 3.128338,
		"shape": null,
		"filename": "20190418-084114-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-084114-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:41:14.210389",
		"updated": "2019-04-18T08:41:14.210389",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.105,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.11,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6268
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11578,
		"description": "eanne d' Arc Living\r\nOoststraat 104 Jean D arc\r\n8800 Roeselare",
		"latitude": 50.947256,
		"longitude": 3.128332,
		"shape": null,
		"filename": "20190418-084237-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-084237-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:42:38.089985",
		"updated": "2019-04-18T08:42:38.089985",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.108,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.11,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6269
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11579,
		"description": "Pips Pilino \r\nOoststraat 102 \r\n8800 Roeselare\r\n051 22 10 60",
		"latitude": 50.947113,
		"longitude": 3.1281004,
		"shape": null,
		"filename": "20190418-085542-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-085542-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:55:43.276462",
		"updated": "2019-04-18T08:55:43.276462",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.17,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.17,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6270
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11580,
		"description": "",
		"latitude": 50.9471549988,
		"longitude": 3.12816667557,
		"shape": null,
		"filename": "20190418-085652-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-085652-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:56:52.254069",
		"updated": "2019-04-18T08:56:52.254069",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.151,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.15,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6271
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11581,
		"description": "",
		"latitude": 50.9470748901367,
		"longitude": 3.12799978256226,
		"shape": null,
		"filename": "20190418-085809-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-085809-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:58:09.228265",
		"updated": "2019-04-18T08:58:09.228265",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.052,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.05,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6272
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11582,
		"description": "",
		"latitude": 50.9470329284668,
		"longitude": 3.12789630889893,
		"shape": null,
		"filename": "20190418-085919-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-085919-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T08:59:19.198345",
		"updated": "2019-04-18T08:59:19.198345",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.034,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.03,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6273
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11583,
		"description": "",
		"latitude": 50.9470710754395,
		"longitude": 3.12783002853394,
		"shape": null,
		"filename": "20190418-090036-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090036-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:00:37.120164",
		"updated": "2019-04-18T09:00:37.120164",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.284,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.28,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6274
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11584,
		"description": "",
		"latitude": 50.9470443725586,
		"longitude": 3.12781524658203,
		"shape": null,
		"filename": "20190418-090221-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090221-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:02:21.226358",
		"updated": "2019-04-18T09:02:21.226358",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.43,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.43,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6275
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11585,
		"description": "",
		"latitude": 50.946964263916,
		"longitude": 3.12773036956787,
		"shape": null,
		"filename": "20190418-090331-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090331-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:03:31.189910",
		"updated": "2019-04-18T09:03:31.189910",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.13,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.13,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6276
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11586,
		"description": "",
		"latitude": 50.946907043457,
		"longitude": 3.12770819664002,
		"shape": null,
		"filename": "20190418-090447-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090447-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:04:47.958991",
		"updated": "2019-04-18T09:04:47.958991",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.808,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.81,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6277
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11587,
		"description": "",
		"latitude": 50.9468841552734,
		"longitude": 3.12767195701599,
		"shape": null,
		"filename": "20190418-090618-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090618-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:06:18.963175",
		"updated": "2019-04-18T09:06:18.963175",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.854,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.85,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6278
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11588,
		"description": "",
		"latitude": 50.9469337463379,
		"longitude": 3.12788343429565,
		"shape": null,
		"filename": "20190418-090735-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090735-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:07:35.989191",
		"updated": "2019-04-18T09:07:35.989191",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.783,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.78,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6279
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11589,
		"description": "",
		"latitude": 50.9470672607422,
		"longitude": 3.12805485725403,
		"shape": null,
		"filename": "20190418-090906-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-090906-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:09:07.147339",
		"updated": "2019-04-18T09:09:07.147339",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.328,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.33,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6280
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11590,
		"description": "",
		"latitude": 50.9472236633301,
		"longitude": 3.12790679931641,
		"shape": null,
		"filename": "20190418-091126-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091126-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:11:26.963513",
		"updated": "2019-04-18T09:11:26.963513",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6281
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11591,
		"description": "",
		"latitude": 50.9473304748535,
		"longitude": 3.12815380096436,
		"shape": null,
		"filename": "20190418-091223-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091223-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:12:23.147693",
		"updated": "2019-04-18T09:12:23.147693",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.037,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.04,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6282
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11592,
		"description": "",
		"latitude": 50.9473266601562,
		"longitude": 3.12826156616211,
		"shape": null,
		"filename": "20190418-091326-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091326-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:13:26.200755",
		"updated": "2019-04-18T09:13:26.200755",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.944,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.94,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6283
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11593,
		"description": "",
		"latitude": 50.9474067687988,
		"longitude": 3.12821626663208,
		"shape": null,
		"filename": "20190418-091429-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091429-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:14:29.239190",
		"updated": "2019-04-18T09:14:29.239190",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.269,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.27,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6284
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11594,
		"description": "",
		"latitude": 50.9473609924316,
		"longitude": 3.12835025787354,
		"shape": null,
		"filename": "20190418-091538-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091538-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:15:39.048844",
		"updated": "2019-04-18T09:15:39.048844",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.222,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.22,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6285
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11595,
		"description": "",
		"latitude": 50.9475059509277,
		"longitude": 3.12861704826355,
		"shape": null,
		"filename": "20190418-091702-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091702-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:17:02.936754",
		"updated": "2019-04-18T09:17:02.936754",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.43,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6286
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11596,
		"description": "",
		"latitude": 50.9474258422852,
		"longitude": 3.12872505187988,
		"shape": null,
		"filename": "20190418-091813-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091813-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:18:13.230094",
		"updated": "2019-04-18T09:18:13.230094",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.801,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.8,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6287
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11597,
		"description": "",
		"latitude": 50.947621,
		"longitude": 3.129572,
		"shape": null,
		"filename": "20190418-091943-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-091943-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:19:44.160428",
		"updated": "2019-04-18T09:19:44.160428",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.402,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.4,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6288
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11598,
		"description": "",
		"latitude": 50.9475860595703,
		"longitude": 3.12912940979004,
		"shape": null,
		"filename": "20190418-092032-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-092032-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:20:32.885445",
		"updated": "2019-04-18T09:20:32.885445",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.619,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.62,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6289
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11599,
		"description": "",
		"latitude": 50.9476203918457,
		"longitude": 3.12922406196594,
		"shape": null,
		"filename": "20190418-092121-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-092121-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:21:22.071294",
		"updated": "2019-04-18T09:21:22.071294",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.597,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.6,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6290
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11600,
		"description": "",
		"latitude": 50.9476699829102,
		"longitude": 3.12928414344788,
		"shape": null,
		"filename": "20190418-092217-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-092217-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:22:18.027998",
		"updated": "2019-04-18T09:22:18.027998",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.247,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.25,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6291
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11601,
		"description": "",
		"latitude": 50.947621,
		"longitude": 3.129572,
		"shape": null,
		"filename": "20190418-092334-44257.wav",
		"file": "https://prod.roundware.com/rwmedia/20190418-092334-44257.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-18T09:23:35.016981",
		"updated": "2019-04-18T09:23:35.016981",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.665,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.67,
		"tag_ids": [
			281
		],
		"session_id": 44257,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6292
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11604,
		"description": "",
		"latitude": 42.3539276123047,
		"longitude": -71.0575942993164,
		"shape": null,
		"filename": "20190422-121932-44335.wav",
		"file": "https://prod.roundware.com/rwmedia/20190422-121932-44335.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-22T12:19:33.071154",
		"updated": "2019-04-22T12:19:33.071154",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.554,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 17.55,
		"tag_ids": [
			91
		],
		"session_id": 44335,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6295
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11606,
		"description": "",
		"latitude": 42.3392601013184,
		"longitude": -71.0950698852539,
		"shape": null,
		"filename": "20190423-142555-44351.wav",
		"file": "https://prod.roundware.com/rwmedia/20190423-142555-44351.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-04-23T14:25:56.060104",
		"updated": "2019-04-23T14:25:56.060104",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.495,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.49,
		"tag_ids": [
			91
		],
		"session_id": 44351,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6297
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11915,
		"description": "",
		"latitude": 42.3016157705648,
		"longitude": -71.4786903512039,
		"shape": null,
		"filename": "20190502-104440-44497.wav",
		"file": "https://prod.roundware.com/rwmedia/20190502-104440-44497.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-02T10:44:41.374434",
		"updated": "2019-05-02T10:44:41.374434",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.123,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.12,
		"tag_ids": [
			92
		],
		"session_id": 44497,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6311
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11916,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20190502-162736-44514.wav",
		"file": "https://prod.roundware.com/rwmedia/20190502-162736-44514.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-02T16:27:36.929565",
		"updated": "2019-05-02T16:27:36.929565",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.802,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.8,
		"tag_ids": [
			92
		],
		"session_id": 44514,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6312
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11917,
		"description": "Fietsbox",
		"latitude": 50.947881,
		"longitude": 3.134339,
		"shape": null,
		"filename": "20190513-095849-44624.wav",
		"file": "https://prod.roundware.com/rwmedia/20190513-095849-44624.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-13T09:58:49.893439",
		"updated": "2019-05-13T09:58:49.893439",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.08,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.08,
		"tag_ids": [
			281
		],
		"session_id": 44624,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6313
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11918,
		"description": "Glas container",
		"latitude": 50.947724,
		"longitude": 3.13466,
		"shape": null,
		"filename": "20190513-101805-44626.wav",
		"file": "https://prod.roundware.com/rwmedia/20190513-101805-44626.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-13T10:18:05.270401",
		"updated": "2019-05-13T10:18:05.270401",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.492,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.49,
		"tag_ids": [
			281
		],
		"session_id": 44626,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6314
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11919,
		"description": "Cafe Breda Jazz",
		"latitude": 50.948231,
		"longitude": 3.135449,
		"shape": null,
		"filename": "20190513-102045-44626.wav",
		"file": "https://prod.roundware.com/rwmedia/20190513-102045-44626.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-13T10:20:45.987268",
		"updated": "2019-05-13T10:20:45.987268",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.052,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.05,
		"tag_ids": [
			281
		],
		"session_id": 44626,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6315
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11920,
		"description": "Lievevrouw beeld Roeselare",
		"latitude": 50.948006,
		"longitude": 3.13508,
		"shape": null,
		"filename": "20190514-052509-44630.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-052509-44630.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T05:25:09.452668",
		"updated": "2019-05-14T05:25:09.452668",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.913,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.91,
		"tag_ids": [
			281
		],
		"session_id": 44630,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6316
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11921,
		"description": "olv, oplaadpunt, elektrische, wagens, Roeselae",
		"latitude": 50.947751,
		"longitude": 3.134341,
		"shape": null,
		"filename": "20190514-075134-44631.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-075134-44631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T07:51:35.176669",
		"updated": "2019-05-14T07:51:35.176669",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.551,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.55,
		"tag_ids": [
			281
		],
		"session_id": 44631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6317
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11922,
		"description": "olv, danken, centrale, Roeselae",
		"latitude": 50.947936,
		"longitude": 3.133984,
		"shape": null,
		"filename": "20190514-075540-44631.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-075540-44631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T07:55:40.179956",
		"updated": "2019-05-14T07:55:40.179956",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.575,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.58,
		"tag_ids": [
			281
		],
		"session_id": 44631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6318
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11923,
		"description": "Coiffeure Philip olv Roeselare",
		"latitude": 50.948161,
		"longitude": 3.134663,
		"shape": null,
		"filename": "20190514-075923-44631.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-075923-44631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T07:59:24.103452",
		"updated": "2019-05-14T07:59:24.103452",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.969,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.97,
		"tag_ids": [
			281
		],
		"session_id": 44631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6319
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11924,
		"description": "vzw, victor, old, Roeselare",
		"latitude": 50.947611,
		"longitude": 3.134259,
		"shape": null,
		"filename": "20190514-080844-44631.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-080844-44631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T08:08:44.491730",
		"updated": "2019-05-14T08:08:44.491730",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.52,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.52,
		"tag_ids": [
			281
		],
		"session_id": 44631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6320
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11925,
		"description": "olv Roeselare huis in de stad",
		"latitude": 50.947626,
		"longitude": 3.134819,
		"shape": null,
		"filename": "20190514-082347-44631.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-082347-44631.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T08:23:47.532101",
		"updated": "2019-05-14T08:23:47.532101",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.551,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 19.55,
		"tag_ids": [
			281
		],
		"session_id": 44631,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6321
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11926,
		"description": "Bakkerij brood sint hubresstraat",
		"latitude": 50.947009,
		"longitude": 3.133879,
		"shape": null,
		"filename": "20190514-083119-44633.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-083119-44633.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T08:31:19.600065",
		"updated": "2019-05-14T08:31:19.600065",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.789,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.79,
		"tag_ids": [
			281
		],
		"session_id": 44633,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6322
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11927,
		"description": "Jean, Pierre, Jeampiere kapper Roeselare Spanjestraat",
		"latitude": 50.946391,
		"longitude": 3.133941,
		"shape": null,
		"filename": "20190514-083353-44633.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-083353-44633.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T08:33:53.293058",
		"updated": "2019-05-14T08:33:53.293058",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.43,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.43,
		"tag_ids": [
			281
		],
		"session_id": 44633,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6323
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11928,
		"description": "Roeselare sint Hubrechtsstraat De Kiem",
		"latitude": 50.94796,
		"longitude": 3.132755,
		"shape": null,
		"filename": "20190514-090408-44639.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-090408-44639.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T09:04:08.807438",
		"updated": "2019-05-14T09:04:08.807438",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.479,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.48,
		"tag_ids": [
			281
		],
		"session_id": 44639,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6324
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11929,
		"description": "Eethuis de steeg sint Hubrechtsstraat Roeselare",
		"latitude": 50.948311,
		"longitude": 3.132239,
		"shape": null,
		"filename": "20190514-091122-44639.wav",
		"file": "https://prod.roundware.com/rwmedia/20190514-091122-44639.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-14T09:11:22.859175",
		"updated": "2019-05-14T09:11:22.859175",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.377,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.38,
		"tag_ids": [
			281
		],
		"session_id": 44639,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6325
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11930,
		"description": "Margo, bruanestraat , Roeselare",
		"latitude": 50.9489631653,
		"longitude": 3.13765478134,
		"shape": null,
		"filename": "20190515-032938-44645.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-032938-44645.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T03:29:39.363953",
		"updated": "2019-05-15T03:29:39.363953",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.452,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.45,
		"tag_ids": [
			281
		],
		"session_id": 44645,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6326
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11931,
		"description": "Ingang, voetbalveld, bruanestraat, Roeselare",
		"latitude": 50.948679,
		"longitude": 3.13727,
		"shape": null,
		"filename": "20190515-033212-44645.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-033212-44645.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T03:32:12.662473",
		"updated": "2019-05-15T03:32:12.662473",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.829,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.83,
		"tag_ids": [
			281
		],
		"session_id": 44645,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6327
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11932,
		"description": "Hotel, De Bonte, oss,Roeselae, Sint Hubrechtsstraat, Roeselae",
		"latitude": 50.948419,
		"longitude": 3.131971,
		"shape": null,
		"filename": "20190515-042701-44646.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-042701-44646.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T04:27:02.001564",
		"updated": "2019-05-15T04:27:02.001564",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.226,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.23,
		"tag_ids": [
			281
		],
		"session_id": 44646,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6328
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11933,
		"description": "bakkerij, de, wulf, korenstraat, Roeselare",
		"latitude": 50.948526,
		"longitude": 3.138191,
		"shape": null,
		"filename": "20190515-110313-44651.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-110313-44651.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T11:03:13.316769",
		"updated": "2019-05-15T11:03:13.316769",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.876,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.88,
		"tag_ids": [
			281
		],
		"session_id": 44651,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6329
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11934,
		"description": "Fitness, oase, korenstraat, Roeselare",
		"latitude": 50.946441,
		"longitude": 3.139779,
		"shape": null,
		"filename": "20190515-110806-44651.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-110806-44651.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T11:08:06.966686",
		"updated": "2019-05-15T11:08:06.966686",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.226,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.23,
		"tag_ids": [
			281
		],
		"session_id": 44651,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6330
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11935,
		"description": "Korenstraat, Roeselare, sport, sportveld, looppiste,",
		"latitude": 50.946171,
		"longitude": 3.139951,
		"shape": null,
		"filename": "20190515-112721-44651.wav",
		"file": "https://prod.roundware.com/rwmedia/20190515-112721-44651.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-15T11:27:21.812889",
		"updated": "2021-03-01T12:21:08.159757",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.77,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.77,
		"tag_ids": [
			282,
			281,
			302
		],
		"session_id": 44651,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6331
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11937,
		"description": "Brouwerij, Rodenbach, spanjestraat, Roeselare",
		"latitude": 50.946021,
		"longitude": 3.137693,
		"shape": null,
		"filename": "20190516-055141-44656.wav",
		"file": "https://prod.roundware.com/rwmedia/20190516-055141-44656.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-16T05:51:41.290589",
		"updated": "2019-05-16T05:51:41.290589",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.922,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.92,
		"tag_ids": [
			281
		],
		"session_id": 44656,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6333
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11938,
		"description": "Het beenhouwerijtje, beenhouwer, Spanjestraat, Roeselare",
		"latitude": 50.946114,
		"longitude": 3.136169,
		"shape": null,
		"filename": "20190517-045416-44663.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-045416-44663.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T04:54:16.456536",
		"updated": "2019-05-17T04:54:16.456536",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.204,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.2,
		"tag_ids": [
			281
		],
		"session_id": 44663,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6334
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11939,
		"description": "Brievenbus, spanjestraat , Roeselare",
		"latitude": 50.946189,
		"longitude": 3.135582,
		"shape": null,
		"filename": "20190517-045601-44663.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-045601-44663.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T04:56:01.497855",
		"updated": "2019-05-17T04:56:01.497855",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.715,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.71,
		"tag_ids": [
			281
		],
		"session_id": 44663,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6335
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11940,
		"description": "",
		"latitude": 42.3607368469238,
		"longitude": -71.0889053344727,
		"shape": null,
		"filename": "20190517-145335-44681.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-145335-44681.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T14:53:36.098632",
		"updated": "2019-05-17T14:53:36.098632",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.244,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.24,
		"tag_ids": [
			91
		],
		"session_id": 44681,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6336
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11941,
		"description": "",
		"latitude": 42.3607406616211,
		"longitude": -71.0889129638672,
		"shape": null,
		"filename": "20190517-145403-44681.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-145403-44681.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T14:54:03.946318",
		"updated": "2019-05-17T14:54:03.946318",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.526,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.53,
		"tag_ids": [
			91
		],
		"session_id": 44681,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6337
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11942,
		"description": "",
		"latitude": 42.3606986999512,
		"longitude": -71.0887680053711,
		"shape": null,
		"filename": "20190517-152610-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-152610-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:26:11.092302",
		"updated": "2019-05-17T15:26:11.092302",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.421,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.42,
		"tag_ids": [
			91,
			302
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6338
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11943,
		"description": "",
		"latitude": 42.3605842590332,
		"longitude": -71.0887451171875,
		"shape": null,
		"filename": "20190517-152706-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-152706-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:27:07.162138",
		"updated": "2019-05-17T15:27:07.162138",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.155,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 35.16,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6339
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11944,
		"description": "",
		"latitude": 42.3608818054199,
		"longitude": -71.0887451171875,
		"shape": null,
		"filename": "20190517-152809-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-152809-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:28:10.436931",
		"updated": "2019-05-17T15:28:10.436931",
		"weight": 50,
		"start_time": 0,
		"end_time": 46.997,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 47,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6340
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11945,
		"description": "",
		"latitude": 42.360710144043,
		"longitude": -71.088996887207,
		"shape": null,
		"filename": "20190517-152858-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-152858-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:28:59.160124",
		"updated": "2019-05-17T15:28:59.160124",
		"weight": 50,
		"start_time": 0,
		"end_time": 29.953,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 29.95,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6341
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11946,
		"description": "",
		"latitude": 42.3606796264648,
		"longitude": -71.0889511108398,
		"shape": null,
		"filename": "20190517-152940-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-152940-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:29:41.189557",
		"updated": "2019-05-17T15:29:41.189557",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.325,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.32,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6342
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11947,
		"description": "",
		"latitude": 42.3606796264648,
		"longitude": -71.0889511108398,
		"shape": null,
		"filename": "20190517-153008-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-153008-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:30:09.071961",
		"updated": "2019-05-17T15:30:09.071961",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.705,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.71,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6343
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11948,
		"description": "",
		"latitude": 42.3606719970703,
		"longitude": -71.0888671875,
		"shape": null,
		"filename": "20190517-153043-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-153043-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:30:43.999484",
		"updated": "2019-05-17T15:30:43.999484",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.563,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.56,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6344
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11949,
		"description": "",
		"latitude": 42.3605041503906,
		"longitude": -71.0887451171875,
		"shape": null,
		"filename": "20190517-153125-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-153125-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:31:26.107935",
		"updated": "2019-05-17T15:31:26.107935",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.904,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 16.9,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6345
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11950,
		"description": "",
		"latitude": 42.3607788085938,
		"longitude": -71.0888748168945,
		"shape": null,
		"filename": "20190517-153207-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-153207-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:32:08.179139",
		"updated": "2019-05-17T15:32:08.179139",
		"weight": 50,
		"start_time": 0,
		"end_time": 30.975,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 30.98,
		"tag_ids": [
			91
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6346
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11951,
		"description": "",
		"latitude": 42.3606491088867,
		"longitude": -71.0887985229492,
		"shape": null,
		"filename": "20190517-153420-44682.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-153420-44682.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:34:21.490223",
		"updated": "2019-05-17T15:34:21.490223",
		"weight": 50,
		"start_time": 0,
		"end_time": 54.799,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 54.8,
		"tag_ids": [
			91,
			302
		],
		"session_id": 44682,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6347
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11952,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-154817-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-154817-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:48:18.540902",
		"updated": "2019-05-17T15:48:18.540902",
		"weight": 50,
		"start_time": 0,
		"end_time": 54.566,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 54.57,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6348
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11953,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-154852-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-154852-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:48:53.137102",
		"updated": "2019-05-17T15:48:53.137102",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.817,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.82,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6349
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11954,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155002-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155002-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:50:03.535385",
		"updated": "2019-05-17T15:50:03.535385",
		"weight": 50,
		"start_time": 0,
		"end_time": 49.83,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 49.83,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6350
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11955,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155044-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155044-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:50:45.284803",
		"updated": "2019-05-17T15:50:45.284803",
		"weight": 50,
		"start_time": 0,
		"end_time": 24.288,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 24.29,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6351
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11956,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155133-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155133-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:51:34.354646",
		"updated": "2019-05-17T15:51:34.354646",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.201,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 35.2,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6352
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11957,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155229-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155229-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:52:30.186656",
		"updated": "2019-05-17T15:52:30.186656",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.464,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.46,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6353
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11958,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155332-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155332-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:53:33.544501",
		"updated": "2019-05-17T15:53:33.544501",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.343,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.34,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6354
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11959,
		"description": "",
		"latitude": 42.3604354858398,
		"longitude": -71.0888595581055,
		"shape": null,
		"filename": "20190517-155442-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155442-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:54:43.549352",
		"updated": "2019-05-17T15:54:43.549352",
		"weight": 50,
		"start_time": 0,
		"end_time": 50.433,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 50.43,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6355
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11960,
		"description": "",
		"latitude": 42.3606796264648,
		"longitude": -71.0888214111328,
		"shape": null,
		"filename": "20190517-155606-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155606-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:56:07.660936",
		"updated": "2019-05-17T15:56:07.660936",
		"weight": 50,
		"start_time": 0,
		"end_time": 59.814,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 59.81,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6356
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11961,
		"description": "",
		"latitude": 42.3604583740234,
		"longitude": -71.0888519287109,
		"shape": null,
		"filename": "20190517-155723-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155723-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:57:24.100813",
		"updated": "2019-05-17T15:57:24.100813",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.452,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.45,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6357
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11962,
		"description": "",
		"latitude": 42.3605155944824,
		"longitude": -71.0888366699219,
		"shape": null,
		"filename": "20190517-155744-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155744-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:57:45.057762",
		"updated": "2019-05-17T15:57:45.057762",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.455,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.46,
		"tag_ids": [
			91
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6358
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11963,
		"description": "",
		"latitude": 42.3605842590332,
		"longitude": -71.0888137817383,
		"shape": null,
		"filename": "20190517-155854-44684.wav",
		"file": "https://prod.roundware.com/rwmedia/20190517-155854-44684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-17T15:58:55.523420",
		"updated": "2019-05-17T15:58:55.523420",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.622,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 48.62,
		"tag_ids": [
			91,
			302
		],
		"session_id": 44684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6359
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11964,
		"description": "",
		"latitude": 50.947940826416,
		"longitude": 3.1345636844635,
		"shape": null,
		"filename": "20190521-075755-44710.wav",
		"file": "https://prod.roundware.com/rwmedia/20190521-075755-44710.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-21T07:57:56.333294",
		"updated": "2019-05-21T07:57:56.333294",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.613,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 9.61,
		"tag_ids": [
			281
		],
		"session_id": 44710,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6360
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11965,
		"description": "",
		"latitude": 50.9518165588379,
		"longitude": 3.12077808380127,
		"shape": null,
		"filename": "20190523-072444-44728.wav",
		"file": "https://prod.roundware.com/rwmedia/20190523-072444-44728.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-23T07:24:44.904909",
		"updated": "2019-05-23T07:24:44.904909",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.575,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.58,
		"tag_ids": [
			281
		],
		"session_id": 44728,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6361
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11966,
		"description": "",
		"latitude": 50.9467010498047,
		"longitude": 3.12459063529968,
		"shape": null,
		"filename": "20190523-081017-44731.wav",
		"file": "https://prod.roundware.com/rwmedia/20190523-081017-44731.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-23T08:10:18.017329",
		"updated": "2019-05-23T08:10:18.017329",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.69,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.69,
		"tag_ids": [
			281
		],
		"session_id": 44731,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6362
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11967,
		"description": "",
		"latitude": 50.9465637207031,
		"longitude": 3.12392210960388,
		"shape": null,
		"filename": "20190523-081224-44731.wav",
		"file": "https://prod.roundware.com/rwmedia/20190523-081224-44731.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-23T08:12:24.408064",
		"updated": "2019-05-23T08:12:24.408064",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.523,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.52,
		"tag_ids": [
			281
		],
		"session_id": 44731,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6363
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11968,
		"description": "",
		"latitude": 50.9456901550293,
		"longitude": 3.1249840259552,
		"shape": null,
		"filename": "20190523-081636-44731.wav",
		"file": "https://prod.roundware.com/rwmedia/20190523-081636-44731.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-05-23T08:16:36.289757",
		"updated": "2019-05-23T08:16:36.289757",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.888,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.89,
		"tag_ids": [
			281
		],
		"session_id": 44731,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6364
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11975,
		"description": "",
		"latitude": 42.4985766923451,
		"longitude": -71.2810565718182,
		"shape": null,
		"filename": "20190607-134247-44842.wav",
		"file": "https://prod.roundware.com/rwmedia/20190607-134247-44842.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-06-07T13:42:47.794848",
		"updated": "2019-06-07T13:42:47.794848",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.616,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.62,
		"tag_ids": [
			281
		],
		"session_id": 44842,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6370
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 11982,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20190702-193331-45218.wav",
		"file": "https://prod.roundware.com/rwmedia/20190702-193331-45218.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-02T19:33:32.336191",
		"updated": "2019-07-02T19:33:32.336191",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.144,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.14,
		"tag_ids": [
			91
		],
		"session_id": 45218,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6378
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12011,
		"description": "",
		"latitude": 40.9945640563965,
		"longitude": -111.9326171875,
		"shape": null,
		"filename": "20190707-002432-45327.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-002432-45327.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T00:24:34.170952",
		"updated": "2019-07-07T00:24:34.170952",
		"weight": 50,
		"start_time": 0,
		"end_time": 101.285,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 101.28,
		"tag_ids": [
			281,
			303
		],
		"session_id": 45327,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6408
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12012,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20190707-011131-45329.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011131-45329.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:11:31.972037",
		"updated": "2019-07-07T01:11:31.972037",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.817,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.82,
		"tag_ids": [
			218
		],
		"session_id": 45329,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6409
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12013,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932601928711,
		"shape": null,
		"filename": "20190707-011246-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011246-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:12:46.954318",
		"updated": "2019-07-07T01:12:46.954318",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.096,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 13.1,
		"tag_ids": [
			281
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6410
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12014,
		"description": "",
		"latitude": 40.9946060180664,
		"longitude": -111.932624816895,
		"shape": null,
		"filename": "20190707-011356-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011356-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:13:56.963179",
		"updated": "2019-07-07T01:13:56.963179",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.65,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.65,
		"tag_ids": [
			92
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6411
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12015,
		"description": "",
		"latitude": 40.9946060180664,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20190707-011452-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011452-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:14:53.035127",
		"updated": "2019-07-07T01:14:53.035127",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.343,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 18.34,
		"tag_ids": [
			282
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6412
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12016,
		"description": "",
		"latitude": 40.9945793151855,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20190707-011548-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011548-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:15:48.948365",
		"updated": "2019-07-07T01:15:48.948365",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.238,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.24,
		"tag_ids": [
			91
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6413
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12017,
		"description": "",
		"latitude": 40.9945755004883,
		"longitude": -111.932632446289,
		"shape": null,
		"filename": "20190707-011712-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011712-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:17:13.127226",
		"updated": "2019-07-07T01:17:13.127226",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.17,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.17,
		"tag_ids": [
			91
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6414
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12018,
		"description": "",
		"latitude": 40.9945640563965,
		"longitude": -111.932662963867,
		"shape": null,
		"filename": "20190707-011815-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011815-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:18:15.991886",
		"updated": "2019-07-07T01:18:15.991886",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.139,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.14,
		"tag_ids": [
			218
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6415
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12019,
		"description": "",
		"latitude": 40.9945945739746,
		"longitude": -111.932647705078,
		"shape": null,
		"filename": "20190707-011939-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-011939-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:19:40.112856",
		"updated": "2019-07-07T01:19:40.112856",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.123,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 25.12,
		"tag_ids": [
			281
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6416
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12020,
		"description": "",
		"latitude": 40.9945907592773,
		"longitude": -111.932685852051,
		"shape": null,
		"filename": "20190707-012256-45330.wav",
		"file": "https://prod.roundware.com/rwmedia/20190707-012256-45330.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-07T01:22:57.351858",
		"updated": "2019-07-07T01:22:57.351858",
		"weight": 50,
		"start_time": 0,
		"end_time": 98.731,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 98.73,
		"tag_ids": [
			91
		],
		"session_id": 45330,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6417
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12032,
		"description": "",
		"latitude": 41.9908485412598,
		"longitude": -71.5252685546875,
		"shape": null,
		"filename": "20190714-170746-45765.wav",
		"file": "https://prod.roundware.com/rwmedia/20190714-170746-45765.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-07-14T17:07:46.615363",
		"updated": "2019-07-14T17:07:46.615363",
		"weight": 50,
		"start_time": 0,
		"end_time": 42.399,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 42.4,
		"tag_ids": [
			91
		],
		"session_id": 45765,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6429
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12079,
		"description": "",
		"latitude": 42.4867818039306,
		"longitude": -71.2761079800048,
		"shape": null,
		"filename": "20190814-113927-47877.wav",
		"file": "https://prod.roundware.com/rwmedia/20190814-113927-47877.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-14T11:39:27.760435",
		"updated": "2019-08-14T11:39:27.760435",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.789,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 15.79,
		"tag_ids": [
			92
		],
		"session_id": 47877,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6475
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12080,
		"description": "",
		"latitude": 42.3374813164216,
		"longitude": -71.0987838987072,
		"shape": null,
		"filename": "20190816-083943-47935.wav",
		"file": "https://prod.roundware.com/rwmedia/20190816-083943-47935.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-16T08:39:43.777073",
		"updated": "2019-08-16T08:39:43.777073",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.717,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.72,
		"tag_ids": [
			299,
			300
		],
		"session_id": 47935,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6476
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12081,
		"description": "",
		"latitude": 42.3377614757541,
		"longitude": -71.0983386440414,
		"shape": null,
		"filename": "20190816-084206-47936.wav",
		"file": "https://prod.roundware.com/rwmedia/20190816-084206-47936.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-16T08:42:06.393500",
		"updated": "2019-08-16T08:42:06.393500",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.376,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.38,
		"tag_ids": [
			299,
			300
		],
		"session_id": 47936,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6477
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12082,
		"description": "",
		"latitude": 42.3384130530179,
		"longitude": -71.0974901960521,
		"shape": null,
		"filename": "20190816-084835-47937.wav",
		"file": "https://prod.roundware.com/rwmedia/20190816-084835-47937.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-16T08:48:35.693117",
		"updated": "2019-08-16T08:48:35.693117",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.546,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.55,
		"tag_ids": [
			299,
			300
		],
		"session_id": 47937,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6478
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12083,
		"description": "",
		"latitude": 42.3386082463959,
		"longitude": -71.0981456378725,
		"shape": null,
		"filename": "20190816-085142-47938.wav",
		"file": "https://prod.roundware.com/rwmedia/20190816-085142-47938.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-16T08:51:42.483434",
		"updated": "2019-08-16T08:51:42.483434",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.802,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.8,
		"tag_ids": [
			299,
			300
		],
		"session_id": 47938,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6479
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 12084,
		"description": "",
		"latitude": 42.3379969029,
		"longitude": -71.0987683619,
		"shape": null,
		"filename": "20190816-085407-47939.wav",
		"file": "https://prod.roundware.com/rwmedia/20190816-085407-47939.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-16T08:54:07.832973",
		"updated": "2019-08-16T08:54:07.832973",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.437,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.44,
		"tag_ids": [
			299,
			300
		],
		"session_id": 47939,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			6480
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13006,
		"description": "",
		"latitude": 42.4986667978042,
		"longitude": -71.2810524646857,
		"shape": null,
		"filename": "20190822-195746-48095.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-195746-48095.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T19:57:46.650675",
		"updated": "2019-08-22T19:57:46.650675",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.12,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 12.12,
		"tag_ids": [
			92
		],
		"session_id": 48095,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7402
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13007,
		"description": "",
		"latitude": 42.4986197682667,
		"longitude": -71.2809768607212,
		"shape": null,
		"filename": "20190822-200837-48095.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-200837-48095.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T20:08:37.249842",
		"updated": "2019-08-22T20:08:37.249842",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.73,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 8.73,
		"tag_ids": [
			91
		],
		"session_id": 48095,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7403
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13009,
		"description": "",
		"latitude": 42.4986192724132,
		"longitude": -71.2809725013294,
		"shape": null,
		"filename": "20190822-200917-48095.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-200917-48095.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T20:09:18.186501",
		"updated": "2019-08-22T20:09:18.186501",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.523,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 7.52,
		"tag_ids": [
			92
		],
		"session_id": 48095,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7404
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13011,
		"description": "",
		"latitude": 42.4985857448005,
		"longitude": -71.2810911890783,
		"shape": null,
		"filename": "20190822-203115-48096.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-203115-48096.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T20:31:15.847401",
		"updated": "2019-08-22T20:31:15.847401",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.572,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.57,
		"tag_ids": [
			92
		],
		"session_id": 48096,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7405
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13013,
		"description": "",
		"latitude": 42.4985960964509,
		"longitude": -71.2810274027952,
		"shape": null,
		"filename": "20190822-205850-48097.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-205850-48097.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T20:58:50.996613",
		"updated": "2019-08-22T20:58:50.996613",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.656,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 11.66,
		"tag_ids": [
			92
		],
		"session_id": 48097,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7406
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13015,
		"description": "",
		"latitude": 42.4985656738281,
		"longitude": -71.2810274027952,
		"shape": null,
		"filename": "20190822-210209-48097.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-210209-48097.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T21:02:10.016008",
		"updated": "2019-08-22T21:02:10.016008",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.018,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.02,
		"tag_ids": [
			92
		],
		"session_id": 48097,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7407
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13017,
		"description": "",
		"latitude": 42.4986044783541,
		"longitude": -71.281040059469,
		"shape": null,
		"filename": "20190822-210524-48098.wav",
		"file": "https://prod.roundware.com/rwmedia/20190822-210524-48098.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-22T21:05:24.291983",
		"updated": "2019-08-22T21:05:24.291983",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.969,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 4.97,
		"tag_ids": [
			91
		],
		"session_id": 48098,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7408
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13019,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190828-162408-48220.wav",
		"file": "https://prod.roundware.com/rwmedia/20190828-162408-48220.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-28T16:24:08.668553",
		"updated": "2019-08-28T16:24:08.668553",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.981,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 11.98,
		"tag_ids": [
			92
		],
		"session_id": 48220,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7410
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13020,
		"description": "",
		"latitude": 42.337436866986,
		"longitude": -71.0988592263973,
		"shape": null,
		"filename": "20190829-121535-48238.wav",
		"file": "https://prod.roundware.com/rwmedia/20190829-121535-48238.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-29T12:15:36.007035",
		"updated": "2019-08-29T12:15:36.007035",
		"weight": 50,
		"start_time": 0,
		"end_time": 48.158,
		"user": {
			"id": 254,
			"username": "1544841525B10C",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "6CDDD76C-62D7-4B59-9625-6F889C9CB10C",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 48.16,
		"tag_ids": [
			91
		],
		"session_id": 48238,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7411
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13021,
		"description": "",
		"latitude": 42.3376397090427,
		"longitude": -71.0984499380655,
		"shape": null,
		"filename": "20190829-122433-48240.wav",
		"file": "https://prod.roundware.com/rwmedia/20190829-122433-48240.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-29T12:24:34.791938",
		"updated": "2019-08-29T12:24:34.791938",
		"weight": 50,
		"start_time": 0,
		"end_time": 55.031,
		"user": {
			"id": 254,
			"username": "1544841525B10C",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "6CDDD76C-62D7-4B59-9625-6F889C9CB10C",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 55.03,
		"tag_ids": [
			91
		],
		"session_id": 48240,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7412
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13022,
		"description": "",
		"latitude": 42.3748827679477,
		"longitude": -71.1141063273615,
		"shape": null,
		"filename": "20190831-173001-48272.wav",
		"file": "https://prod.roundware.com/rwmedia/20190831-173001-48272.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-08-31T17:30:02.725975",
		"updated": "2019-08-31T17:30:02.725975",
		"weight": 50,
		"start_time": 0,
		"end_time": 88.421,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 88.42,
		"tag_ids": [
			91
		],
		"session_id": 48272,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7413
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13023,
		"description": "",
		"latitude": 42.4981013965257,
		"longitude": -71.2799981889048,
		"shape": null,
		"filename": "20190903-092403-48310.wav",
		"file": "https://prod.roundware.com/rwmedia/20190903-092403-48310.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-03T09:24:03.928599",
		"updated": "2019-09-03T09:24:03.928599",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.452,
		"user": {
			"id": 254,
			"username": "1544841525B10C",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "6CDDD76C-62D7-4B59-9625-6F889C9CB10C",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 23.45,
		"tag_ids": [
			92
		],
		"session_id": 48310,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7414
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13024,
		"description": "",
		"latitude": 1,
		"longitude": 1,
		"shape": null,
		"filename": "20190904-125622-48452.wav",
		"file": "https://prod.roundware.com/rwmedia/20190904-125622-48452.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-04T12:56:23.134056",
		"updated": "2019-09-04T12:56:23.134056",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.922,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 10.92,
		"tag_ids": [
			91
		],
		"session_id": 48452,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7415
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13027,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190908-161548-48789.wav",
		"file": "https://prod.roundware.com/rwmedia/20190908-161548-48789.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-08T16:15:48.452561",
		"updated": "2019-09-08T16:15:48.452561",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.359,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 8.36,
		"tag_ids": [
			282
		],
		"session_id": 48789,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7420
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13028,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190908-182550-48793.wav",
		"file": "https://prod.roundware.com/rwmedia/20190908-182550-48793.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-08T18:25:50.844679",
		"updated": "2019-09-08T18:25:50.844679",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.504,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 4.5,
		"tag_ids": [
			218
		],
		"session_id": 48793,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7421
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13029,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190909-104214-48813.wav",
		"file": "https://prod.roundware.com/rwmedia/20190909-104214-48813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-09T10:42:15.320025",
		"updated": "2019-09-09T10:42:15.320025",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.385,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 13.38,
		"tag_ids": [
			218
		],
		"session_id": 48813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7422
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13030,
		"description": "",
		"latitude": 40.759211,
		"longitude": -73.984638,
		"shape": null,
		"filename": "20190909-105829-48813.wav",
		"file": "https://prod.roundware.com/rwmedia/20190909-105829-48813.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-09T10:58:29.566768",
		"updated": "2019-09-09T10:58:29.566768",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.229,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 9.23,
		"tag_ids": [
			92
		],
		"session_id": 48813,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7423
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13031,
		"description": "",
		"latitude": 40.759211,
		"longitude": -73.984638,
		"shape": null,
		"filename": "20190909-113948-48821.wav",
		"file": "https://prod.roundware.com/rwmedia/20190909-113948-48821.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-09T11:39:48.980768",
		"updated": "2019-09-09T11:39:48.980768",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.399,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 11.4,
		"tag_ids": [
			92
		],
		"session_id": 48821,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7424
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13032,
		"description": "",
		"latitude": 40.759211,
		"longitude": -73.984638,
		"shape": null,
		"filename": "20190909-115727-48832.wav",
		"file": "https://prod.roundware.com/rwmedia/20190909-115727-48832.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-09T11:57:27.896726",
		"updated": "2019-09-09T11:57:27.896726",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.105,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 8.11,
		"tag_ids": [
			281
		],
		"session_id": 48832,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7425
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13034,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190909-153241-48888.wav",
		"file": "https://prod.roundware.com/rwmedia/20190909-153241-48888.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-09T15:32:42.320279",
		"updated": "2019-09-09T15:32:42.320279",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.362,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 6.36,
		"tag_ids": [
			282
		],
		"session_id": 48888,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7427
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13035,
		"description": "",
		"latitude": 42.3607906932406,
		"longitude": -71.0879451502777,
		"shape": null,
		"filename": "20190910-115331-48932.wav",
		"file": "https://prod.roundware.com/rwmedia/20190910-115331-48932.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-10T11:53:31.682824",
		"updated": "2019-09-10T11:53:31.682824",
		"weight": 50,
		"start_time": 0,
		"end_time": 9.427,
		"user": {
			"id": 254,
			"username": "1544841525B10C",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "6CDDD76C-62D7-4B59-9625-6F889C9CB10C",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 9.43,
		"tag_ids": [
			91
		],
		"session_id": 48932,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7428
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13040,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190912-125247-49040.wav",
		"file": "https://prod.roundware.com/rwmedia/20190912-125247-49040.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-12T12:52:47.821967",
		"updated": "2019-09-12T12:52:47.821967",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.993,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 14.99,
		"tag_ids": [
			218
		],
		"session_id": 49040,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7434
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13041,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190912-143137-49047.wav",
		"file": "https://prod.roundware.com/rwmedia/20190912-143137-49047.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-12T14:31:37.249091",
		"updated": "2019-09-12T14:31:37.249091",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.237,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 2.24,
		"tag_ids": [
			92
		],
		"session_id": 49047,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7435
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13043,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20190912-182637-49062.wav",
		"file": "https://prod.roundware.com/rwmedia/20190912-182637-49062.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-09-12T18:26:37.994078",
		"updated": "2019-09-12T18:26:37.994078",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.339,
		"user": {
			"id": 458,
			"username": "1567022818CE5E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A97CB75C-A045-445D-B2EE-716BD64DCE5E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 2.34,
		"tag_ids": [
			282
		],
		"session_id": 49062,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7437
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13128,
		"description": "",
		"latitude": 42.3861042084567,
		"longitude": -71.1192756146855,
		"shape": null,
		"filename": "20191012-101757-51293.wav",
		"file": "https://prod.roundware.com/rwmedia/20191012-101757-51293.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-10-12T10:17:58.367817",
		"updated": "2019-10-12T10:18:00.553075",
		"weight": 50,
		"start_time": 0,
		"end_time": 66.873,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 66.87,
		"tag_ids": [
			91
		],
		"session_id": 51293,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7607
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13136,
		"description": "",
		"latitude": 38.4107614676144,
		"longitude": -121.343225362641,
		"shape": null,
		"filename": "20191124-233106-52684.wav",
		"file": "https://prod.roundware.com/rwmedia/20191124-233106-52684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-11-24T23:31:06.980097",
		"updated": "2019-11-24T23:31:09.342096",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.108,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 5.11,
		"tag_ids": [
			218
		],
		"session_id": 52684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7618
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13137,
		"description": "",
		"latitude": 38.4107354614946,
		"longitude": -121.343206695271,
		"shape": null,
		"filename": "20191124-233209-52684.wav",
		"file": "https://prod.roundware.com/rwmedia/20191124-233209-52684.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-11-24T23:32:09.748871",
		"updated": "2019-11-24T23:32:10.996516",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.739,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 2.74,
		"tag_ids": [
			92
		],
		"session_id": 52684,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7619
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13253,
		"description": "",
		"latitude": 40.3084199783565,
		"longitude": -75.1265374979681,
		"shape": null,
		"filename": "20191220-130610-53669.wav",
		"file": "https://prod.roundware.com/rwmedia/20191220-130610-53669.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-12-20T13:06:11.028473",
		"updated": "2019-12-20T13:06:13.352545",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.687,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 6.69,
		"tag_ids": [
			91
		],
		"session_id": 53669,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7881
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13255,
		"description": "",
		"latitude": 33.9076453081389,
		"longitude": -118.06157634012,
		"shape": null,
		"filename": "20191231-054214-53716.wav",
		"file": "https://prod.roundware.com/rwmedia/20191231-054214-53716.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2019-12-31T05:42:14.321110",
		"updated": "2019-12-31T05:42:16.397593",
		"weight": 50,
		"start_time": 0,
		"end_time": 3.065,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 3.06,
		"tag_ids": [
			282
		],
		"session_id": 53716,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7883
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13263,
		"description": "",
		"latitude": -26.626917019379,
		"longitude": 152.962120186339,
		"shape": null,
		"filename": "20200212-002142-54234.wav",
		"file": "https://prod.roundware.com/rwmedia/20200212-002142-54234.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-12T00:21:42.752209",
		"updated": "2020-02-12T00:21:44.029724",
		"weight": 50,
		"start_time": 0,
		"end_time": 38.173,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 38.17,
		"tag_ids": [
			91
		],
		"session_id": 54234,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7889
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13264,
		"description": "",
		"latitude": -26.6353675144927,
		"longitude": 152.947230145976,
		"shape": null,
		"filename": "20200212-173343-54243.wav",
		"file": "https://prod.roundware.com/rwmedia/20200212-173343-54243.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-12T17:33:44.525874",
		"updated": "2020-02-12T17:33:46.541032",
		"weight": 50,
		"start_time": 0,
		"end_time": 33.761,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 33.76,
		"tag_ids": [
			218
		],
		"session_id": 54243,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7890
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13268,
		"description": "",
		"latitude": -26.6353597084651,
		"longitude": 152.947247182714,
		"shape": null,
		"filename": "20200212-210250-54244.wav",
		"file": "https://prod.roundware.com/rwmedia/20200212-210250-54244.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-12T21:02:52.026535",
		"updated": "2020-02-12T21:02:53.350294",
		"weight": 50,
		"start_time": 0,
		"end_time": 113.731,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 113.73,
		"tag_ids": [
			281
		],
		"session_id": 54244,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7891
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13270,
		"description": "",
		"latitude": -26.6330477568405,
		"longitude": 152.957890515108,
		"shape": null,
		"filename": "20200218-214637-54360.wav",
		"file": "https://prod.roundware.com/rwmedia/20200218-214637-54360.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-18T21:46:37.948619",
		"updated": "2020-02-18T21:46:40.260958",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.439,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 16.44,
		"tag_ids": [
			281
		],
		"session_id": 54360,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7893
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13273,
		"description": "",
		"latitude": -26.6270654621333,
		"longitude": 152.959242334843,
		"shape": null,
		"filename": "20200219-035902-54367.wav",
		"file": "https://prod.roundware.com/rwmedia/20200219-035902-54367.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-19T03:59:03.668249",
		"updated": "2020-02-19T03:59:04.921004",
		"weight": 50,
		"start_time": 0,
		"end_time": 76.115,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 76.11,
		"tag_ids": [
			218
		],
		"session_id": 54367,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7894
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13279,
		"description": "",
		"latitude": -26.642060340702,
		"longitude": 152.950291460666,
		"shape": null,
		"filename": "20200225-184410-54433.wav",
		"file": "https://prod.roundware.com/rwmedia/20200225-184410-54433.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-02-25T18:44:10.558020",
		"updated": "2020-03-26T18:41:43.246074",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.777,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 23.78,
		"tag_ids": [
			91
		],
		"session_id": 54433,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7896
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13296,
		"description": "",
		"latitude": -26.6342469330132,
		"longitude": 152.94359419695,
		"shape": null,
		"filename": "20200328-214955-54834.wav",
		"file": "https://prod.roundware.com/rwmedia/20200328-214955-54834.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-03-28T21:49:56.351844",
		"updated": "2020-03-28T21:49:57.680576",
		"weight": 50,
		"start_time": 0,
		"end_time": 29.86,
		"user": {
			"id": 539,
			"username": "15814846829D50",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A2F41EBB-6807-44A8-AF1E-30424E769D50",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 29.86,
		"tag_ids": [
			92
		],
		"session_id": 54834,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			7918
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13398,
		"description": "",
		"latitude": 42.4985749321454,
		"longitude": -71.2810709886917,
		"shape": null,
		"filename": "20200406-121902-56420.wav",
		"file": "https://prod.roundware.com/rwmedia/20200406-121902-56420.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-06T12:19:02.533567",
		"updated": "2020-04-06T12:19:04.235885",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.025,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 7.03,
		"tag_ids": [
			91
		],
		"session_id": 56420,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8040
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13399,
		"description": "",
		"latitude": 42.4985960545414,
		"longitude": -71.281087668679,
		"shape": null,
		"filename": "20200406-122253-56420.wav",
		"file": "https://prod.roundware.com/rwmedia/20200406-122253-56420.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-06T12:22:53.402835",
		"updated": "2020-04-06T12:22:54.883529",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.478,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 8.48,
		"tag_ids": [
			91
		],
		"session_id": 56420,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8041
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13400,
		"description": "",
		"latitude": 42.4986381736049,
		"longitude": -71.2809047755518,
		"shape": null,
		"filename": "20200406-123026-56421.wav",
		"file": "https://prod.roundware.com/rwmedia/20200406-123026-56421.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-06T12:30:26.865451",
		"updated": "2020-04-06T12:30:28.558363",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.719,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 7.72,
		"tag_ids": [
			91
		],
		"session_id": 56421,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8042
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13401,
		"description": "",
		"latitude": 25.782513618533,
		"longitude": -80.1325302124024,
		"shape": null,
		"filename": "20200406-123446-56422.wav",
		"file": "https://prod.roundware.com/rwmedia/20200406-123446-56422.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-06T12:34:46.429649",
		"updated": "2020-04-06T12:34:47.953172",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.967,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 12.97,
		"tag_ids": [
			91
		],
		"session_id": 56422,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8043
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13446,
		"description": "",
		"latitude": 53.2213316553407,
		"longitude": 6.55715438059169,
		"shape": null,
		"filename": "20200410-124111-58340.wav",
		"file": "https://prod.roundware.com/rwmedia/20200410-124111-58340.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-10T12:41:12.757877",
		"updated": "2021-04-30T18:17:15.106832",
		"weight": 50,
		"start_time": 0,
		"end_time": 102.26,
		"user": {
			"id": 579,
			"username": "15865363920099",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "56CF89CA-3190-4C51-AE0D-5197B53F0099",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 102.26,
		"tag_ids": [
			91
		],
		"session_id": 58340,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8085
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13551,
		"description": "",
		"latitude": 36.3202031096782,
		"longitude": -94.1209885106367,
		"shape": null,
		"filename": "20200423-131642-62621.wav",
		"file": "https://prod.roundware.com/rwmedia/20200423-131642-62621.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-23T13:16:42.278370",
		"updated": "2020-04-23T13:16:43.905696",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.767,
		"user": {
			"id": 593,
			"username": "1587049613D79E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "ADFF59B1-F5A2-46A8-A37B-7B1CBB22D79E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 14.77,
		"tag_ids": [
			218
		],
		"session_id": 62621,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8190
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13552,
		"description": "",
		"latitude": 36.3201767485927,
		"longitude": -94.1209378839416,
		"shape": null,
		"filename": "20200423-131945-62621.wav",
		"file": "https://prod.roundware.com/rwmedia/20200423-131945-62621.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-04-23T13:19:45.219885",
		"updated": "2020-04-23T13:19:46.607318",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.365,
		"user": {
			"id": 593,
			"username": "1587049613D79E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "ADFF59B1-F5A2-46A8-A37B-7B1CBB22D79E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 4.37,
		"tag_ids": [
			91
		],
		"session_id": 62621,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8191
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13625,
		"description": "",
		"latitude": 42.2164247130704,
		"longitude": -72.622011343612,
		"shape": null,
		"filename": "20200505-142942-68543.wav",
		"file": "https://prod.roundware.com/rwmedia/20200505-142942-68543.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-05T14:29:43.206137",
		"updated": "2020-05-05T14:29:44.545082",
		"weight": 50,
		"start_time": 0,
		"end_time": 105.557,
		"user": {
			"id": 558,
			"username": "15833552749A44",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "9D715C8F-8C80-4360-96DD-B7F0A8369A44",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 105.56,
		"tag_ids": [
			91
		],
		"session_id": 68543,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8265
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13676,
		"description": "",
		"latitude": 34.3988677587283,
		"longitude": -83.6567481313374,
		"shape": null,
		"filename": "20200524-022947-71464.wav",
		"file": "https://prod.roundware.com/rwmedia/20200524-022947-71464.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-24T02:29:47.936025",
		"updated": "2020-05-24T02:29:49.417162",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.353,
		"user": {
			"id": 3516,
			"username": "1590301497342E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "549D9EC4-AB24-4949-8A1F-DFAD9AB7342E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 12.35,
		"tag_ids": [
			218
		],
		"session_id": 71464,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8315
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13677,
		"description": "",
		"latitude": 34.3988548986977,
		"longitude": -83.6567236416274,
		"shape": null,
		"filename": "20200524-023604-71464.wav",
		"file": "https://prod.roundware.com/rwmedia/20200524-023604-71464.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-24T02:36:05.892338",
		"updated": "2020-05-24T02:36:07.149047",
		"weight": 50,
		"start_time": 0,
		"end_time": 120,
		"user": {
			"id": 3516,
			"username": "1590301497342E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "549D9EC4-AB24-4949-8A1F-DFAD9AB7342E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120,
		"tag_ids": [
			218
		],
		"session_id": 71464,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8316
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13679,
		"description": "",
		"latitude": 34.3988637123036,
		"longitude": -83.6568573781378,
		"shape": null,
		"filename": "20200524-025902-71465.wav",
		"file": "https://prod.roundware.com/rwmedia/20200524-025902-71465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-24T02:59:03.774805",
		"updated": "2020-05-24T02:59:04.813837",
		"weight": 50,
		"start_time": 0,
		"end_time": 120,
		"user": {
			"id": 3516,
			"username": "1590301497342E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "549D9EC4-AB24-4949-8A1F-DFAD9AB7342E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120,
		"tag_ids": [
			218
		],
		"session_id": 71465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8317
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13680,
		"description": "",
		"latitude": 34.3988220021449,
		"longitude": -83.6567583215271,
		"shape": null,
		"filename": "20200524-030207-71465.wav",
		"file": "https://prod.roundware.com/rwmedia/20200524-030207-71465.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-24T03:02:08.042250",
		"updated": "2020-05-24T03:02:09.150870",
		"weight": 50,
		"start_time": 0,
		"end_time": 120,
		"user": {
			"id": 3516,
			"username": "1590301497342E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "549D9EC4-AB24-4949-8A1F-DFAD9AB7342E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120,
		"tag_ids": [
			282
		],
		"session_id": 71465,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8318
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13682,
		"description": "",
		"latitude": 34.3987051678993,
		"longitude": -83.6565412754159,
		"shape": null,
		"filename": "20200525-011540-71502.wav",
		"file": "https://prod.roundware.com/rwmedia/20200525-011540-71502.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-05-25T01:15:41.659597",
		"updated": "2020-05-25T01:15:43.369313",
		"weight": 50,
		"start_time": 0,
		"end_time": 101.61,
		"user": {
			"id": 3516,
			"username": "1590301497342E",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "549D9EC4-AB24-4949-8A1F-DFAD9AB7342E",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 101.61,
		"tag_ids": [
			218
		],
		"session_id": 71502,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8320
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13728,
		"description": "",
		"latitude": 40.6717998636605,
		"longitude": -73.9634280700183,
		"shape": null,
		"filename": "20200614-135034-73169.wav",
		"file": "https://prod.roundware.com/rwmedia/20200614-135034-73169.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-06-14T13:50:35.692859",
		"updated": "2020-06-14T13:50:36.427401",
		"weight": 50,
		"start_time": 0,
		"end_time": 59.907,
		"user": {
			"id": 3844,
			"username": "159147818630AE",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "DE422D0B-E5B3-4E11-93C7-216E161630AE",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 59.91,
		"tag_ids": [
			218
		],
		"session_id": 73169,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8366
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13730,
		"description": "",
		"latitude": 40.671795784087,
		"longitude": -73.9634585406344,
		"shape": null,
		"filename": "20200614-135539-73169.wav",
		"file": "https://prod.roundware.com/rwmedia/20200614-135539-73169.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-06-14T13:55:40.816085",
		"updated": "2020-06-14T13:55:41.610010",
		"weight": 50,
		"start_time": 0,
		"end_time": 120,
		"user": {
			"id": 3844,
			"username": "159147818630AE",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "DE422D0B-E5B3-4E11-93C7-216E161630AE",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120,
		"tag_ids": [
			218
		],
		"session_id": 73169,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8367
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 13742,
		"description": "",
		"latitude": 55.6694723379783,
		"longitude": 12.5211401911847,
		"shape": null,
		"filename": "20200704-120242-74549.wav",
		"file": "https://prod.roundware.com/rwmedia/20200704-120242-74549.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-07-04T12:02:43.004212",
		"updated": "2020-08-04T11:56:24.022307",
		"weight": 50,
		"start_time": 0,
		"end_time": 29.164,
		"user": {
			"id": 469,
			"username": "15678847748DAF",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "822ED88A-1AE5-40AC-B80E-14B94A6A8DAF",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 29.16,
		"tag_ids": [
			218
		],
		"session_id": 74549,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			8379
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14340,
		"description": "",
		"latitude": 42.458886479661,
		"longitude": -71.3560957169736,
		"shape": null,
		"filename": "20201228-131447-82640.wav",
		"file": "https://prod.roundware.com/rwmedia/20201228-131447-82640.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2020-12-28T13:14:47.389894",
		"updated": "2020-12-28T13:14:48.810180",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.526,
		"user": {
			"id": 6909,
			"username": "1609179158CD01",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "F230943A-E12F-4937-ACCC-48E57D3FCD01",
			"client_type": "iPad"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 5.53,
		"tag_ids": [
			218
		],
		"session_id": 82640,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9012
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14348,
		"description": "",
		"latitude": 41.7961809128563,
		"longitude": -71.4222882686101,
		"shape": null,
		"filename": "20210203-220844-83369.wav",
		"file": "https://prod.roundware.com/rwmedia/20210203-220844-83369.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-03T22:08:44.970339",
		"updated": "2021-02-03T22:08:46.505554",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.421,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 13.42,
		"tag_ids": [
			91
		],
		"session_id": 83369,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9018
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14353,
		"description": "",
		"latitude": 41.8612330004545,
		"longitude": -71.3872859135462,
		"shape": null,
		"filename": "20210211-152352-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-152352-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:23:53.279418",
		"updated": "2021-02-11T15:23:54.547619",
		"weight": 50,
		"start_time": 0,
		"end_time": 100.681,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 100.68,
		"tag_ids": [
			91
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9022
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14354,
		"description": "",
		"latitude": 41.8612330004545,
		"longitude": -71.3872859135462,
		"shape": null,
		"filename": "20210211-152748-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-152748-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:27:49.643183",
		"updated": "2021-02-11T15:27:50.413902",
		"weight": 50,
		"start_time": 0,
		"end_time": 64.551,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 64.55,
		"tag_ids": [
			218
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9023
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14356,
		"description": "",
		"latitude": 41.7960633248149,
		"longitude": -71.4222731150803,
		"shape": null,
		"filename": "20210211-153228-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-153228-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:32:29.640618",
		"updated": "2021-02-11T15:32:30.412111",
		"weight": 50,
		"start_time": 0,
		"end_time": 95.851,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 95.85,
		"tag_ids": [
			92
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9024
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14357,
		"description": "",
		"latitude": 41.7971348501929,
		"longitude": -71.4220331121351,
		"shape": null,
		"filename": "20210211-153606-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-153606-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:36:07.513672",
		"updated": "2021-02-11T15:36:08.253997",
		"weight": 50,
		"start_time": 0,
		"end_time": 67.477,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 67.48,
		"tag_ids": [
			218
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9025
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14359,
		"description": "",
		"latitude": 41.7989555548263,
		"longitude": -71.4231976373995,
		"shape": null,
		"filename": "20210211-154143-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-154143-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:41:43.833825",
		"updated": "2021-02-11T15:41:44.592839",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.857,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 31.86,
		"tag_ids": [
			218
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9026
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14360,
		"description": "",
		"latitude": 41.7994494400936,
		"longitude": -71.4233674585057,
		"shape": null,
		"filename": "20210211-154412-83500.wav",
		"file": "https://prod.roundware.com/rwmedia/20210211-154412-83500.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-11T15:44:12.844949",
		"updated": "2021-02-11T15:44:13.612024",
		"weight": 50,
		"start_time": 0,
		"end_time": 27.538,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 27.54,
		"tag_ids": [
			218
		],
		"session_id": 83500,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9027
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14361,
		"description": "",
		"latitude": 50.7911014105828,
		"longitude": -2.81007428167747,
		"shape": null,
		"filename": "20210212-084314-83512.wav",
		"file": "https://prod.roundware.com/rwmedia/20210212-084314-83512.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-12T08:43:15.026961",
		"updated": "2021-02-16T16:04:13.292154",
		"weight": 50,
		"start_time": 0,
		"end_time": 64.272,
		"user": {
			"id": 7185,
			"username": "161308550966A1",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "15AB29F3-7EF9-4215-BBD1-B310E1F266A1",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 64.27,
		"tag_ids": [
			281
		],
		"session_id": 83512,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9028
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14363,
		"description": "",
		"latitude": 41.796860412783,
		"longitude": -71.4216974143644,
		"shape": null,
		"filename": "20210216-165309-83581.wav",
		"file": "https://prod.roundware.com/rwmedia/20210216-165309-83581.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-16T16:53:10.472603",
		"updated": "2021-02-16T16:53:11.160731",
		"weight": 50,
		"start_time": 0,
		"end_time": 89.35,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 89.35,
		"tag_ids": [
			92
		],
		"session_id": 83581,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9029
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14365,
		"description": "",
		"latitude": 41.7971479654291,
		"longitude": -71.419978850498,
		"shape": null,
		"filename": "20210216-165711-83581.wav",
		"file": "https://prod.roundware.com/rwmedia/20210216-165711-83581.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-16T16:57:11.957608",
		"updated": "2021-02-16T16:57:12.939391",
		"weight": 50,
		"start_time": 0,
		"end_time": 31.532,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 31.53,
		"tag_ids": [
			218
		],
		"session_id": 83581,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9030
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14369,
		"description": "",
		"latitude": 25.6970732489344,
		"longitude": -80.1620364339589,
		"shape": null,
		"filename": "20210221-114558-83824.wav",
		"file": "https://prod.roundware.com/rwmedia/20210221-114558-83824.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-02-21T11:45:58.942815",
		"updated": "2021-02-21T11:46:00.885583",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.541,
		"user": {
			"id": 7252,
			"username": "1613925704304F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "40894938-06EC-4BF2-B227-37D42366304F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 10.54,
		"tag_ids": [
			91
		],
		"session_id": 83824,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9033
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14390,
		"description": "",
		"latitude": 42.3493219430448,
		"longitude": -71.2044935956038,
		"shape": null,
		"filename": "20210324-131051-84785.wav",
		"file": "https://prod.roundware.com/rwmedia/20210324-131051-84785.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-03-24T13:10:52.083182",
		"updated": "2021-03-24T13:10:53.491641",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.467,
		"user": {
			"id": 7418,
			"username": "1616433859FC18",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A50FC42F-1F67-414F-95F6-53190C13FC18",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 28.47,
		"tag_ids": [
			91
		],
		"session_id": 84785,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9047
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14405,
		"description": "",
		"latitude": -37.1854336248924,
		"longitude": 175.304408390237,
		"shape": null,
		"filename": "20210401-144516-85314.wav",
		"file": "https://prod.roundware.com/rwmedia/20210401-144516-85314.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-04-01T14:45:16.892640",
		"updated": "2021-04-01T14:45:18.240524",
		"weight": 50,
		"start_time": 0,
		"end_time": 23.591,
		"user": {
			"id": 7509,
			"username": "1617302558B7EA",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "27993290-2ACD-47D7-BC2E-9B9CAC39B7EA",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 23.59,
		"tag_ids": [
			218
		],
		"session_id": 85314,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9053
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14442,
		"description": "",
		"latitude": 38.337158203125,
		"longitude": -121.982074147204,
		"shape": null,
		"filename": "20210423-000341-86100.wav",
		"file": "https://prod.roundware.com/rwmedia/20210423-000341-86100.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-04-23T00:03:41.336085",
		"updated": "2021-04-23T00:03:42.998670",
		"weight": 50,
		"start_time": 0,
		"end_time": 7.105,
		"user": {
			"id": 7616,
			"username": "1619150406E5AB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "93B8DFC2-5ED4-49EA-A938-DA140BC5E5AB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 7.11,
		"tag_ids": [
			91
		],
		"session_id": 86100,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9078
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14454,
		"description": "",
		"latitude": 42.8509152,
		"longitude": -72.5578678,
		"shape": null,
		"filename": "20210425-214817-86159.wav",
		"file": "https://prod.roundware.com/rwmedia/20210425-214817-86159.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-04-25T21:48:17.195283",
		"updated": "2021-04-25T21:48:18.489694",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.021,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 16.02,
		"tag_ids": [
			92
		],
		"session_id": 86159,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9086
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14473,
		"description": "",
		"latitude": 4.9187217,
		"longitude": -74.022557,
		"shape": null,
		"filename": "20210428-170823-86298.wav",
		"file": "https://prod.roundware.com/rwmedia/20210428-170823-86298.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-04-28T17:08:24.114373",
		"updated": "2021-04-28T17:08:25.689296",
		"weight": 50,
		"start_time": 0,
		"end_time": 110.434,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 110.43,
		"tag_ids": [
			91
		],
		"session_id": 86298,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9101
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14487,
		"description": "",
		"latitude": 57.7104114895755,
		"longitude": 12.0131544289979,
		"shape": null,
		"filename": "20210430-030101-86351.wav",
		"file": "https://prod.roundware.com/rwmedia/20210430-030101-86351.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-04-30T03:01:01.559795",
		"updated": "2021-04-30T18:10:06.219066",
		"weight": 50,
		"start_time": 0,
		"end_time": 43.142,
		"user": {
			"id": 7677,
			"username": "161976592287DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "C528977F-EF1C-4D23-BC85-CB2C9F8E87DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 43.14,
		"tag_ids": [
			91
		],
		"session_id": 86351,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9109
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14521,
		"description": "",
		"latitude": 42.4989460828179,
		"longitude": -71.2806351297267,
		"shape": null,
		"filename": "20210503-172729-86797.wav",
		"file": "https://prod.roundware.com/rwmedia/20210503-172729-86797.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-03T17:27:29.577239",
		"updated": "2021-05-23T19:49:17.139746",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.16,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 12.16,
		"tag_ids": [
			92
		],
		"session_id": 86797,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9142
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14552,
		"description": "",
		"latitude": 42.498295018489,
		"longitude": -71.2798804231652,
		"shape": null,
		"filename": "20210506-152938-87211.wav",
		"file": "https://prod.roundware.com/rwmedia/20210506-152938-87211.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-06T15:29:39.059779",
		"updated": "2021-05-23T19:49:07.440669",
		"weight": 50,
		"start_time": 0,
		"end_time": 16,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 16,
		"tag_ids": [
			218
		],
		"session_id": 87211,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9166
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14554,
		"description": "",
		"latitude": 42.4980713054934,
		"longitude": -71.2804464530864,
		"shape": null,
		"filename": "20210506-171308-87217.wav",
		"file": "https://prod.roundware.com/rwmedia/20210506-171308-87217.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-06T17:13:08.248767",
		"updated": "2021-05-23T19:49:06.146913",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.904,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 11.9,
		"tag_ids": [
			91
		],
		"session_id": 87217,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9167
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14558,
		"description": "",
		"latitude": 42.36069,
		"longitude": -71.087473,
		"shape": null,
		"filename": "20210506-234403-87224.wav",
		"file": "https://prod.roundware.com/rwmedia/20210506-234403-87224.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-06T23:44:03.728841",
		"updated": "2021-05-06T23:44:05.185504",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.925,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 2.92,
		"tag_ids": [
			92
		],
		"session_id": 87224,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9169
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14559,
		"description": "",
		"latitude": 42.1398577,
		"longitude": -71.5163049,
		"shape": null,
		"filename": "20210507-003404-87225.wav",
		"file": "https://prod.roundware.com/rwmedia/20210507-003404-87225.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-07T00:34:05.076258",
		"updated": "2021-05-07T00:34:06.257236",
		"weight": 50,
		"start_time": 0,
		"end_time": 50.201,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 50.2,
		"tag_ids": [
			92
		],
		"session_id": 87225,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9170
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14560,
		"description": "",
		"latitude": 42.4980119947101,
		"longitude": -71.2802069317383,
		"shape": null,
		"filename": "20210507-103523-87261.wav",
		"file": "https://prod.roundware.com/rwmedia/20210507-103523-87261.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-07T10:35:23.490050",
		"updated": "2021-05-23T19:48:59.726985",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.472,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 25.47,
		"tag_ids": [
			92
		],
		"session_id": 87261,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9171
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14561,
		"description": "",
		"latitude": 42.498059822286,
		"longitude": -71.2800090015598,
		"shape": null,
		"filename": "20210507-153440-87313.wav",
		"file": "https://prod.roundware.com/rwmedia/20210507-153440-87313.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-07T15:34:40.340483",
		"updated": "2021-05-23T19:48:53.218145",
		"weight": 50,
		"start_time": 0,
		"end_time": 10.24,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 10.24,
		"tag_ids": [
			91
		],
		"session_id": 87313,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9172
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14568,
		"description": "",
		"latitude": 42.36069,
		"longitude": -71.087473,
		"shape": null,
		"filename": "20210512-091002-87861.wav",
		"file": "https://prod.roundware.com/rwmedia/20210512-091002-87861.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-12T09:10:02.602506",
		"updated": "2021-05-23T12:48:26.183488",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.864,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 4.86,
		"tag_ids": [
			91
		],
		"session_id": 87861,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9184
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14581,
		"description": "",
		"latitude": 42.4981637997949,
		"longitude": -71.2809069548466,
		"shape": null,
		"filename": "20210519-123803-88172.wav",
		"file": "https://prod.roundware.com/rwmedia/20210519-123803-88172.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-19T12:38:03.133288",
		"updated": "2021-05-23T19:48:42.330769",
		"weight": 50,
		"start_time": 0,
		"end_time": 18.048,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 18.05,
		"tag_ids": [
			91
		],
		"session_id": 88172,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9197
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14582,
		"description": "",
		"latitude": 42.4989203848766,
		"longitude": -71.2805560045608,
		"shape": null,
		"filename": "20210519-125259-88174.wav",
		"file": "https://prod.roundware.com/rwmedia/20210519-125259-88174.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-19T12:52:59.576554",
		"updated": "2021-05-23T19:48:36.493617",
		"weight": 50,
		"start_time": 0,
		"end_time": 21.504,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 21.5,
		"tag_ids": [
			218
		],
		"session_id": 88174,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9198
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14583,
		"description": "",
		"latitude": 42.6704357438977,
		"longitude": -70.5326634296875,
		"shape": null,
		"filename": "20210519-154103-88176.wav",
		"file": "https://prod.roundware.com/rwmedia/20210519-154103-88176.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-19T15:41:03.809802",
		"updated": "2021-05-19T15:41:05.225870",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.946,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 11.95,
		"tag_ids": [
			91
		],
		"session_id": 88176,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9199
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14585,
		"description": "",
		"latitude": 42.3237329532156,
		"longitude": -70.5668812920998,
		"shape": null,
		"filename": "20210519-164611-88190.wav",
		"file": "https://prod.roundware.com/rwmedia/20210519-164611-88190.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-19T16:46:11.554292",
		"updated": "2021-05-19T16:46:12.385425",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.442,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 6.44,
		"tag_ids": [
			91
		],
		"session_id": 88190,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9201
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14586,
		"description": "",
		"latitude": 42.7762015,
		"longitude": -71.0772796,
		"shape": null,
		"filename": "20210519-164930-88194.wav",
		"file": "https://prod.roundware.com/rwmedia/20210519-164930-88194.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-19T16:49:31.026067",
		"updated": "2021-05-19T16:49:31.849333",
		"weight": 50,
		"start_time": 0,
		"end_time": 2.739,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 2.74,
		"tag_ids": [
			92
		],
		"session_id": 88194,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9202
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14589,
		"description": "",
		"latitude": 45.4215296,
		"longitude": -75.6971931,
		"shape": null,
		"filename": "20210521-235023-88262.wav",
		"file": "https://prod.roundware.com/rwmedia/20210521-235023-88262.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-21T23:50:23.199963",
		"updated": "2021-05-21T23:50:24.595912",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.498,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 8.5,
		"tag_ids": [
			218
		],
		"session_id": 88262,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9205
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14590,
		"description": "",
		"latitude": 46.4917317,
		"longitude": -80.993029,
		"shape": null,
		"filename": "20210522-004932-88268.wav",
		"file": "https://prod.roundware.com/rwmedia/20210522-004932-88268.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-22T00:49:32.986513",
		"updated": "2021-05-22T00:49:34.224468",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.557,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 15.56,
		"tag_ids": [
			92
		],
		"session_id": 88268,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9206
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14591,
		"description": "",
		"latitude": 51.629799,
		"longitude": -85.945192,
		"shape": null,
		"filename": "20210522-010826-88278.wav",
		"file": "https://prod.roundware.com/rwmedia/20210522-010826-88278.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-22T01:08:26.472585",
		"updated": "2021-05-22T01:08:27.372222",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.108,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 5.11,
		"tag_ids": [
			92
		],
		"session_id": 88278,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9207
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14592,
		"description": "",
		"latitude": 42.4989027483784,
		"longitude": -71.2805968244293,
		"shape": null,
		"filename": "20210523-125644-88350.wav",
		"file": "https://prod.roundware.com/rwmedia/20210523-125644-88350.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-05-23T12:56:44.374466",
		"updated": "2021-05-23T17:07:46.553862",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.294,
		"user": null,
		"media_type": "audio",
		"audio_length_in_seconds": 20.29,
		"tag_ids": [
			91
		],
		"session_id": 88350,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9208
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14595,
		"description": "",
		"latitude": 40.6550214719406,
		"longitude": -74.9315125309629,
		"shape": null,
		"filename": "20210605-133656-88593.wav",
		"file": "https://prod.roundware.com/rwmedia/20210605-133656-88593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-05T13:36:57.463942",
		"updated": "2021-06-05T13:36:58.604360",
		"weight": 50,
		"start_time": 0,
		"end_time": 86.939,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 86.94,
		"tag_ids": [
			218
		],
		"session_id": 88593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9211
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14597,
		"description": "",
		"latitude": 40.6595143396786,
		"longitude": -74.929282441805,
		"shape": null,
		"filename": "20210605-141946-88593.wav",
		"file": "https://prod.roundware.com/rwmedia/20210605-141946-88593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-05T14:19:47.389941",
		"updated": "2021-06-05T14:19:48.516764",
		"weight": 50,
		"start_time": 0,
		"end_time": 88.332,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 88.33,
		"tag_ids": [
			218
		],
		"session_id": 88593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9212
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14599,
		"description": "",
		"latitude": 40.6604200462258,
		"longitude": -74.931407086621,
		"shape": null,
		"filename": "20210605-143121-88593.wav",
		"file": "https://prod.roundware.com/rwmedia/20210605-143121-88593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-05T14:31:22.307893",
		"updated": "2021-06-05T14:31:23.089879",
		"weight": 50,
		"start_time": 0,
		"end_time": 109.601,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 109.6,
		"tag_ids": [
			218
		],
		"session_id": 88593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9213
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14600,
		"description": "",
		"latitude": 40.6618402758992,
		"longitude": -74.9325005058897,
		"shape": null,
		"filename": "20210605-144118-88593.wav",
		"file": "https://prod.roundware.com/rwmedia/20210605-144118-88593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-05T14:41:19.663337",
		"updated": "2021-06-05T14:41:20.454076",
		"weight": 50,
		"start_time": 0,
		"end_time": 120.05,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120.05,
		"tag_ids": [
			218
		],
		"session_id": 88593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9214
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14602,
		"description": "",
		"latitude": 40.659377882295,
		"longitude": -74.9291697052074,
		"shape": null,
		"filename": "20210605-145129-88593.wav",
		"file": "https://prod.roundware.com/rwmedia/20210605-145129-88593.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-05T14:51:30.199095",
		"updated": "2021-06-05T14:51:31.000681",
		"weight": 50,
		"start_time": 0,
		"end_time": 112.295,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 112.3,
		"tag_ids": [
			218
		],
		"session_id": 88593,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9215
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14612,
		"description": "",
		"latitude": 42.36069,
		"longitude": -71.087473,
		"shape": null,
		"filename": "20210629-150811-89447.wav",
		"file": "https://prod.roundware.com/rwmedia/20210629-150811-89447.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-06-29T15:08:12.058802",
		"updated": "2021-06-29T15:08:13.795262",
		"weight": 50,
		"start_time": 0,
		"end_time": 16.279,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 16.28,
		"tag_ids": [
			218
		],
		"session_id": 89447,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9224
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14614,
		"description": "",
		"latitude": 34.222926722286,
		"longitude": -116.319032630766,
		"shape": null,
		"filename": "20210701-170611-89478.wav",
		"file": "https://prod.roundware.com/rwmedia/20210701-170611-89478.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-01T17:06:11.726497",
		"updated": "2021-07-01T17:06:13.632070",
		"weight": 50,
		"start_time": 0,
		"end_time": 6.458,
		"user": {
			"id": 8008,
			"username": "1625172600D76D",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A233D699-6843-4DD6-A928-19352A8AD76D",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 6.46,
		"tag_ids": [
			91
		],
		"session_id": 89478,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9226
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14619,
		"description": "",
		"latitude": 41.817607588384,
		"longitude": -71.3893687373882,
		"shape": null,
		"filename": "20210705-152720-89624.wav",
		"file": "https://prod.roundware.com/rwmedia/20210705-152720-89624.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-05T15:27:20.556714",
		"updated": "2021-07-05T15:27:22.281445",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.601,
		"user": {
			"id": 571,
			"username": "1584813784384F",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "41F8B487-FE58-4B56-8179-D1251B04384F",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 19.6,
		"tag_ids": [
			218
		],
		"session_id": 89624,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9231
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14620,
		"description": "",
		"latitude": 34.2228842493382,
		"longitude": -116.319018904297,
		"shape": null,
		"filename": "20210705-160937-89632.wav",
		"file": "https://prod.roundware.com/rwmedia/20210705-160937-89632.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-05T16:09:37.950370",
		"updated": "2021-07-05T16:09:39.217510",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.369,
		"user": {
			"id": 8008,
			"username": "1625172600D76D",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A233D699-6843-4DD6-A928-19352A8AD76D",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 4.37,
		"tag_ids": [
			91
		],
		"session_id": 89632,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9232
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14641,
		"description": "",
		"latitude": 44.2890305864106,
		"longitude": -68.9088398405061,
		"shape": null,
		"filename": "20210720-094636-89987.wav",
		"file": "https://prod.roundware.com/rwmedia/20210720-094636-89987.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-20T09:46:37.005871",
		"updated": "2021-07-20T09:46:41.326707",
		"weight": 50,
		"start_time": 0,
		"end_time": 4.601,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 4.6,
		"tag_ids": [
			92
		],
		"session_id": 89987,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9246
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14657,
		"description": "",
		"latitude": 44.2354667047451,
		"longitude": -68.9302874543415,
		"shape": null,
		"filename": "20210724-145048-90135.wav",
		"file": "https://prod.roundware.com/rwmedia/20210724-145048-90135.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-24T14:50:48.552610",
		"updated": "2021-07-24T14:50:49.974841",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.437,
		"user": {
			"id": 7643,
			"username": "161946499889DB",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "12D5C292-37F3-4661-A0EE-BC9B74DD89DB",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 5.44,
		"tag_ids": [
			91
		],
		"session_id": 90135,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9258
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14658,
		"description": "",
		"latitude": 44.2354363622556,
		"longitude": -68.9303203952209,
		"shape": null,
		"filename": "20210725-105757-90161.wav",
		"file": "https://prod.roundware.com/rwmedia/20210725-105757-90161.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-07-25T10:57:58.211426",
		"updated": "2021-07-25T10:57:59.428288",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.313,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 25.31,
		"tag_ids": [
			91
		],
		"session_id": 90161,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9259
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14671,
		"description": "this is a test <a href=\"https://roundware.org\">asset.description</a> that should show up when properly indicated in .env :-)",
		"latitude": 19.4563596,
		"longitude": 72.7924612,
		"shape": null,
		"filename": "20210802-053207-90411.wav",
		"file": "https://prod.roundware.com/rwmedia/20210802-053207-90411.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-02T05:32:08.655326",
		"updated": "2021-08-22T13:24:59.544167",
		"weight": 50,
		"start_time": 0,
		"end_time": 61.279,
		"user": {
			"id": 8121,
			"username": "1627814751iT1M",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "RZYQJHFTeE_HjrJKxiT1M",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 61.28,
		"tag_ids": [
			218
		],
		"session_id": 90411,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9274
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14719,
		"description": "",
		"latitude": 45.9249344912052,
		"longitude": -123.978539356756,
		"shape": null,
		"filename": "20210815-011348-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011348-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:13:50.106800",
		"updated": "2021-08-15T01:13:51.537873",
		"weight": 50,
		"start_time": 0,
		"end_time": 113.224,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 113.22,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9322
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14720,
		"description": "",
		"latitude": 45.9249344912052,
		"longitude": -123.978539356756,
		"shape": null,
		"filename": "20210815-011544-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011544-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:15:45.253663",
		"updated": "2021-08-15T01:15:45.976717",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.356,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 12.36,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9323
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14721,
		"description": "",
		"latitude": 40.7101159343222,
		"longitude": -110.712116330692,
		"shape": null,
		"filename": "20210815-011641-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011641-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:16:41.428405",
		"updated": "2021-08-15T01:16:42.645904",
		"weight": 50,
		"start_time": 0,
		"end_time": 12.356,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 12.36,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9324
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14722,
		"description": "",
		"latitude": 40.7101159343222,
		"longitude": -110.712116330692,
		"shape": null,
		"filename": "20210815-011748-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011748-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:17:48.857115",
		"updated": "2021-08-15T01:17:49.513876",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.378,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 13.38,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9325
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14723,
		"description": "",
		"latitude": 40.7101159343222,
		"longitude": -110.712116330692,
		"shape": null,
		"filename": "20210815-011836-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011836-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:18:37.057397",
		"updated": "2021-08-15T01:18:37.714343",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.554,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 19.55,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9326
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14724,
		"description": "",
		"latitude": 40.7101159343222,
		"longitude": -110.712116330692,
		"shape": null,
		"filename": "20210815-011941-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-011941-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:19:42.164726",
		"updated": "2021-08-15T01:19:42.845266",
		"weight": 50,
		"start_time": 0,
		"end_time": 13.192,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 13.19,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9327
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14725,
		"description": "",
		"latitude": 40.7101159343222,
		"longitude": -110.712116330692,
		"shape": null,
		"filename": "20210815-012311-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-012311-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:23:12.098231",
		"updated": "2021-08-15T01:23:12.720511",
		"weight": 50,
		"start_time": 0,
		"end_time": 20.855,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 20.86,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9328
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14726,
		"description": "",
		"latitude": 40.9946123450794,
		"longitude": -111.932637947536,
		"shape": null,
		"filename": "20210815-012442-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-012442-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:24:43.066663",
		"updated": "2021-08-15T01:24:43.746721",
		"weight": 50,
		"start_time": 0,
		"end_time": 14.121,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 14.12,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9329
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14727,
		"description": "",
		"latitude": 40.9946164420695,
		"longitude": -111.932642896543,
		"shape": null,
		"filename": "20210815-012608-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-012608-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:26:08.967979",
		"updated": "2021-08-15T01:26:09.584436",
		"weight": 50,
		"start_time": 0,
		"end_time": 36.737,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 36.74,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9330
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14728,
		"description": "",
		"latitude": 40.9946164420695,
		"longitude": -111.932642896543,
		"shape": null,
		"filename": "20210815-012715-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-012715-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:27:15.886164",
		"updated": "2021-08-15T01:27:16.566425",
		"weight": 50,
		"start_time": 0,
		"end_time": 11.892,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 11.89,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9331
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14729,
		"description": "",
		"latitude": 40.9946164420695,
		"longitude": -111.932642896543,
		"shape": null,
		"filename": "20210815-013019-91083.wav",
		"file": "https://prod.roundware.com/rwmedia/20210815-013019-91083.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-15T01:30:21.671533",
		"updated": "2021-08-15T01:30:22.342892",
		"weight": 50,
		"start_time": 0,
		"end_time": 112.899,
		"user": {
			"id": 8188,
			"username": "16290023231E48",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "A115FE17-8946-4807-8A24-6D54779E1E48",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 112.9,
		"tag_ids": [
			91
		],
		"session_id": 91083,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9332
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14731,
		"description": "",
		"latitude": 40.9946753686556,
		"longitude": -111.932653444844,
		"shape": null,
		"filename": "20210819-173840-91157.wav",
		"file": "https://prod.roundware.com/rwmedia/20210819-173840-91157.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-19T17:38:41.046295",
		"updated": "2021-08-19T17:38:42.513461",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.297,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 34.3,
		"tag_ids": [
			92
		],
		"session_id": 91157,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9334
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14742,
		"description": "",
		"latitude": 50.1699869245763,
		"longitude": -5.10694196132965,
		"shape": null,
		"filename": "20210823-050544-91608.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-050544-91608.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T05:05:47.023027",
		"updated": "2021-08-23T09:38:54.858199",
		"weight": 50,
		"start_time": 0,
		"end_time": 120.05,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 120.05,
		"tag_ids": [
			218
		],
		"session_id": 91608,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9354
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14743,
		"description": "",
		"latitude": 50.169934442438,
		"longitude": -5.10641868505471,
		"shape": null,
		"filename": "20210823-054006-91610.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-054006-91610.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T05:40:06.943722",
		"updated": "2021-08-23T09:40:13.159968",
		"weight": 50,
		"start_time": 0,
		"end_time": 39.106,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 39.11,
		"tag_ids": [
			281
		],
		"session_id": 91610,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9355
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14744,
		"description": "",
		"latitude": 50.1708270431251,
		"longitude": -5.11150530457496,
		"shape": null,
		"filename": "20210823-092621-91632.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-092621-91632.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T09:26:22.268432",
		"updated": "2021-08-23T09:40:14.038602",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.545,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 25.55,
		"tag_ids": [
			92
		],
		"session_id": 91632,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9356
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14745,
		"description": "",
		"latitude": 50.1708270431251,
		"longitude": -5.11150530457496,
		"shape": null,
		"filename": "20210823-092621-91632_0.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-092621-91632_0.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T09:26:22.371315",
		"updated": "2021-08-23T09:40:17.660110",
		"weight": 50,
		"start_time": 0,
		"end_time": 25.545,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 25.55,
		"tag_ids": [
			92
		],
		"session_id": 91632,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9356
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14747,
		"description": "",
		"latitude": 51.5246653777824,
		"longitude": -0.076750547844525,
		"shape": null,
		"filename": "20210823-183829-91670.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-183829-91670.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T18:38:30.458017",
		"updated": "2021-08-23T19:10:17.856361",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.112,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 35.11,
		"tag_ids": [
			218
		],
		"session_id": 91670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9357
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14748,
		"description": "",
		"latitude": 51.5246653777824,
		"longitude": -0.076750547844525,
		"shape": null,
		"filename": "20210823-183829-91670_0.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-183829-91670_0.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T18:38:30.550409",
		"updated": "2021-08-23T19:10:08.420091",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.112,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 35.11,
		"tag_ids": [
			218
		],
		"session_id": 91670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9357
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14750,
		"description": "",
		"latitude": 51.5217170217826,
		"longitude": -0.0942614376433817,
		"shape": null,
		"filename": "20210823-190753-91670.wav",
		"file": "https://prod.roundware.com/rwmedia/20210823-190753-91670.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-23T19:07:54.008815",
		"updated": "2021-08-23T19:10:06.052557",
		"weight": 50,
		"start_time": 0,
		"end_time": 17.279,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 17.28,
		"tag_ids": [
			92
		],
		"session_id": 91670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9358
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14751,
		"description": "",
		"latitude": 0,
		"longitude": 0,
		"shape": null,
		"filename": "20210825-155800-91670.wav",
		"file": "https://prod.roundware.com/rwmedia/20210825-155800-91670.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-25T15:58:01.254930",
		"updated": "2021-08-25T15:58:02.917953",
		"weight": 50,
		"start_time": 0,
		"end_time": 45.096,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 45.1,
		"tag_ids": [
			281
		],
		"session_id": 91670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9359
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14752,
		"description": "",
		"latitude": 36.9025383983708,
		"longitude": -3.42247044144413,
		"shape": null,
		"filename": "20210826-092559-91670.wav",
		"file": "https://prod.roundware.com/rwmedia/20210826-092559-91670.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-26T09:26:00.251172",
		"updated": "2021-08-29T21:21:02.493384",
		"weight": 50,
		"start_time": 0,
		"end_time": 44.028,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 44.03,
		"tag_ids": [
			218
		],
		"session_id": 91670,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9360
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14753,
		"description": "",
		"latitude": 19.4407597,
		"longitude": 72.8085305,
		"shape": null,
		"filename": "20210827-004906-91909.wav",
		"file": "https://prod.roundware.com/rwmedia/20210827-004906-91909.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-27T00:49:07.074588",
		"updated": "2021-08-27T00:49:08.898231",
		"weight": 50,
		"start_time": 0,
		"end_time": 8.343,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 8.34,
		"tag_ids": [
			281
		],
		"session_id": 91909,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9368
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14754,
		"description": "",
		"latitude": 19.4407597,
		"longitude": 72.8085305,
		"shape": null,
		"filename": "20210827-013832-91914.wav",
		"file": "https://prod.roundware.com/rwmedia/20210827-013832-91914.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-27T01:38:32.286436",
		"updated": "2021-08-27T01:38:33.601724",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.644,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 5.64,
		"tag_ids": [
			281
		],
		"session_id": 91914,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9369
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14755,
		"description": "",
		"latitude": 19.4407394657117,
		"longitude": 72.808348109787,
		"shape": null,
		"filename": "20210827-032050-91942.wav",
		"file": "https://prod.roundware.com/rwmedia/20210827-032050-91942.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-27T03:20:51.040418",
		"updated": "2021-08-27T03:20:52.239626",
		"weight": 50,
		"start_time": 0,
		"end_time": 5.133,
		"user": {
			"id": 80,
			"username": "14961803690000",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "00000000000000",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 5.13,
		"tag_ids": [
			92
		],
		"session_id": 91942,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9377
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14756,
		"description": "",
		"latitude": 19.4406964678407,
		"longitude": 72.8086136484795,
		"shape": null,
		"filename": "20210827-033819-91946.wav",
		"file": "https://prod.roundware.com/rwmedia/20210827-033819-91946.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-27T03:38:20.200739",
		"updated": "2021-08-27T03:38:21.085852",
		"weight": 50,
		"start_time": 0,
		"end_time": 34.753,
		"user": {
			"id": 8264,
			"username": "1629888958CurT",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "Eup76Rk3_aGXd-uCECurT",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 34.75,
		"tag_ids": [
			281
		],
		"session_id": 91946,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9378
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14757,
		"description": "",
		"latitude": 36.8847940898869,
		"longitude": -3.17962483122361,
		"shape": null,
		"filename": "20210827-131751-91971.wav",
		"file": "https://prod.roundware.com/rwmedia/20210827-131751-91971.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-27T13:17:53.054849",
		"updated": "2021-08-29T21:20:17.712625",
		"weight": 50,
		"start_time": 0,
		"end_time": 35.623,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 35.62,
		"tag_ids": [
			218
		],
		"session_id": 91971,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9379
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14758,
		"description": "",
		"latitude": 44.2353567,
		"longitude": -68.9303709,
		"shape": null,
		"filename": "20210828-140222-92030.wav",
		"file": "https://prod.roundware.com/rwmedia/20210828-140222-92030.mp3",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-28T14:02:23.233886",
		"updated": "2021-08-28T14:02:24.889115",
		"weight": 50,
		"start_time": 0,
		"end_time": 19.808,
		"user": {
			"id": 8211,
			"username": "1629466015ur5I",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "i9ppL2wcZ7A8-cM84ur5I",
			"client_type": "web"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 19.81,
		"tag_ids": [
			92
		],
		"session_id": 92030,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9380
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14761,
		"description": "",
		"latitude": 44.2362837307567,
		"longitude": -68.9284562599556,
		"shape": null,
		"filename": "20210828-171322-92037.wav",
		"file": "https://prod.roundware.com/rwmedia/20210828-171322-92037.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-28T17:13:23.752567",
		"updated": "2021-08-28T17:13:24.863590",
		"weight": 50,
		"start_time": 0,
		"end_time": 28.796,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 28.8,
		"tag_ids": [
			91
		],
		"session_id": 92037,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9381
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14762,
		"description": "",
		"latitude": 44.236967568327,
		"longitude": -68.9289798774467,
		"shape": null,
		"filename": "20210828-171323-92037.wav",
		"file": "https://prod.roundware.com/rwmedia/20210828-171323-92037.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-28T17:13:24.343754",
		"updated": "2021-08-28T17:13:25.625092",
		"weight": 50,
		"start_time": 0,
		"end_time": 29.26,
		"user": {
			"id": 577,
			"username": "1586189762DA26",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "E6A47E74-E948-40DE-89C9-751A83E4DA26",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 29.26,
		"tag_ids": [
			91
		],
		"session_id": 92037,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9382
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	},
	{
		"id": 14764,
		"description": "",
		"latitude": 36.8846723604859,
		"longitude": -3.17966907544072,
		"shape": null,
		"filename": "20210829-191808-91971.wav",
		"file": "https://prod.roundware.com/rwmedia/20210829-191808-91971.m4a",
		"volume": 1,
		"submitted": true,
		"created": "2021-08-29T19:18:08.833092",
		"updated": "2021-08-29T21:20:16.568536",
		"weight": 50,
		"start_time": 0,
		"end_time": 15.607,
		"user": {
			"id": 8250,
			"username": "16297093343CE3",
			"first_name": "",
			"last_name": "",
			"email": "",
			"device_id": "B22F9112-4A33-4FCA-83D4-5ED1C38C3CE3",
			"client_type": "iPhone"
		},
		"media_type": "audio",
		"audio_length_in_seconds": 15.61,
		"tag_ids": [
			218
		],
		"session_id": 91971,
		"project_id": 10,
		"language_id": 1,
		"envelope_ids": [
			9383
		],
		"description_loc_ids": [],
		"alt_text_loc_ids": []
	}
]