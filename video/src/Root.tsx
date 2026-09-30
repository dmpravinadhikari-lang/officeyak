import "./index.css";
import { Composition } from "remotion";
import { DURATION, FPS, StrideIntro } from "./StrideIntro";
import {
  HappyPandaReel,
  REEL_DURATION,
  REEL_FPS,
} from "./happypanda/HappyPandaReel";
import {
  ShilakshyaReel,
  REEL_DURATION as SH_DURATION,
  REEL_FPS as SH_FPS,
} from "./shilakshya/ShilakshyaReel";
import { TipsReel, REEL_FPS as TIPS_FPS } from "./tips/TipsReel";
import { tipsSchema, layout as tipsLayout } from "./tips/schema";
import { AlevReel, REEL_FPS as AL_FPS } from "./alev/AlevReel";
import { alevSchema, layout as alevLayout } from "./alev/schema";
import { OfficeYakReel, REEL_FPS as OY_FPS } from "./officeyak/OfficeYakReel";
import { officeYakSchema, layout as oyLayout } from "./officeyak/schema";

/**
 * Every video in one file.
 *
 * Remotion Studio can only write the props form back into the code when the
 * <Composition> and its defaultProps literal live in the root file, so this is
 * where they live. Editing a headline is a change here, not in the reel.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StrideIntro"
        component={StrideIntro}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      {/* Instagram Reels: 9:16, which is also what TikTok and WhatsApp status
          want, so one render covers all three. */}
      <Composition
        id="HappyPandaReel"
        component={HappyPandaReel}
        durationInFrames={REEL_DURATION}
        fps={REEL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="ShilakshyaReel"
        component={ShilakshyaReel}
        durationInFrames={SH_DURATION}
        fps={SH_FPS}
        width={1080}
        height={1920}
      />
      {/* Five tips for building a house in Nepal, each on the technical
          sheet drawn for it. */}
      <Composition
        id="HouseTipsReel"
        component={TipsReel}
        schema={tipsSchema}
        defaultProps={{
          hookTop: "घर बनाउँदा",
          hookBig: "५ कुरा",
          hookUnder: "जुन धेरैले छुटाउँछन्",
          tips: [
            {
              n: "१",
              title: "जग अघि माटो जाँच",
              line: "रु. १५–५० हजारको टेस्टले लाखौं बचाउँछ।",
              art: "soil" as const,
              colour: "#4FB06E",
            },
            {
              n: "२",
              title: "Setback सिमानाबाट होइन",
              line: "बाटोको केन्द्रबाट नापिन्छ।",
              art: "setback" as const,
              colour: "#3D9BE0",
            },
            {
              n: "३",
              title: "नक्सा पास मात्र पुग्दैन",
              line: "सम्पन्न प्रमाणपत्र नभए लोन र बिक्री अड्किन्छ।",
              art: "certificate" as const,
              colour: "#DFA340",
            },
            {
              n: "४",
              title: "प्रति वर्गफिटमा नलेख्नुहोस्",
              line: "BOQ माग्नुहोस् — कुन grade, कति रड।",
              art: "boq" as const,
              colour: "#E0704F",
            },
            {
              n: "५",
              title: "ढलानको पानी",
              line: "मिक्समा कम, curing मा १४ दिन।",
              art: "water" as const,
              colour: "#9B7BE0",
            },
          ],
          closeAsk: "घर बनाउने सोच्दै?",
          closeSite: "shilakshya.com.np",
          closeButton: "LINK IN BIO",
          music: {
            file: "",
            volume: 0.32,
            fadeIn: 0.5,
            fadeOut: 1.2,
            startAt: 0,
            loop: true,
          },
          voice: {
            file: "",
            volume: 1,
            fadeIn: 0.1,
            fadeOut: 0.3,
            startAt: 0,
            loop: false,
          },
          timing: { hook: 2.4, perTip: 2.8, close: 3.2 },
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: tipsLayout(
            props.timing,
            props.tips.length,
            TIPS_FPS,
          ).total,
        })}
        fps={TIPS_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="AlevReel"
        component={AlevReel}
        schema={alevSchema}
        defaultProps={{
          hookTop: "This doesn’t fit",
          hookBottom: "on a plate",
          hookPhoto: "alev/longest-kebab.jpg",
          kicker: "Alev Kebab Sultanate · Naxal",
          dishes: [
            {
              name: "Longest Kebab",
              say: "Mutton Adana and minced mutton, end to end.",
              photo: "alev/longest-kebab.jpg",
              shape: "band" as const,
            },
            {
              name: "Sultan’s Grill",
              say: "Chicken Adana, chicken sis and wings.",
              photo: "alev/sultans-grill.jpg",
              shape: "arch" as const,
            },
            {
              name: "Grilled Meat Platter",
              say: "Pilau, dill and saffron rice, under the skewers.",
              photo: "alev/skewer-tower.jpg",
              shape: "arch" as const,
            },
          ],
          tableTop: "Tables of 4.",
          tableBottom: "Tables of 14.",
          tablePhoto: "alev/table-night.jpg",
          nepaliLine: "साथीभाइ जम्मा गर्नुहोस्।",
          spreadTitle: "And everything before it",
          spreadPhotos: [
            "alev/mezze.jpg",
            "alev/falafel.jpg",
            "alev/salad.jpg",
            "alev/mixed-grill.jpg",
          ],
          spreadKicker: "Meze · Falafel · Salatasi",
          occasionPhoto: "alev/celebration.jpg",
          occasionWords: ["Birthdays.", "Anniversaries.", "Tuesdays."],
          logo: "alev/logo.png",
          where: "Tangalwood, Naxal",
          hours: "8 am – 10 pm, daily",
          phone: "01-4527343",
          site: "alevkebab.com.np",
          gold: "#D8A848",
          ember: "#7A1316",
          music: {
            file: "",
            volume: 0.32,
            fadeIn: 0.5,
            fadeOut: 1.2,
            startAt: 0,
            loop: true,
          },
          voice: {
            file: "",
            volume: 1,
            fadeIn: 0.1,
            fadeOut: 0.3,
            startAt: 0,
            loop: false,
          },
          timing: {
            hook: 2.8,
            perDish: 2.2,
            table: 3.4,
            spread: 3.2,
            occasion: 2.6,
            close: 3,
          },
        }}
        // The length follows the seconds typed into the form, so the timeline can
        // never disagree with what the reel actually plays.
        calculateMetadata={({ props }) => ({
          durationInFrames: alevLayout(
            props.timing,
            props.dishes.length,
            AL_FPS,
          ).total,
        })}
        fps={AL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="OfficeYakReel"
        component={OfficeYakReel}
        schema={officeYakSchema}
        defaultProps={{
          figures: [
            { n: "400", of: "student files" },
            { n: "12", of: "classes" },
            { n: "3", of: "offices" },
            { n: "1", of: "inbox that never sleeps" },
          ],
          loadLine: "Something has to carry it.",

          markWhat: "AI-powered consultancy OS",

          yakLabel: "Yak says",
          yakSays:
            "Call Niraj first. Walk-ins convert 2.1 times more often when they are rung within a day.",
          yakUnder: "One recommendation per screen, always with the reason behind it.",

          peaksTitle: "Grow. Prepare. Run.",
          peaks: [
            {
              name: "Grow",
              say: "Walk-ins and calls become leads; leads become files on the board.",
              chips: ["Student leads", "Students board", "Market", "Scholarship finder"],
              colour: "#F0407A",
            },
            {
              name: "Prepare",
              say: "Attendance clocked inside the office. Mocks marked to band tables.",
              chips: ["Attendance", "Mock tests", "AI interview", "SOP Studio", "Documents"],
              colour: "#FF7A1A",
            },
            {
              name: "Run",
              say: "Staff, payroll in the Nepali month, offices side by side on Monday.",
              chips: ["Staff and teams", "Payroll", "Offices", "Reports"],
              colour: "#FFC526",
            },
          ],

          proofs: [
            {
              shot: "officeyak/students.jpg",
              caption: "Every office in one list",
              zoom: 1.55,
              focus: "62% 42%",
            },
            {
              shot: "officeyak/attendance.jpg",
              caption: "Clock in from inside the office",
              zoom: 1.5,
              focus: "58% 22%",
            },
            {
              shot: "officeyak/reports.jpg",
              caption: "Five offices, side by side",
              zoom: 1.5,
              focus: "55% 18%",
            },
          ],
          proofBadges: ["Built in Nepal", "Nepali-month payroll", "Works on mobile data"],

          closeLine: "Every branch, carried like your best branch.",
          price: "Rs 4,999",
          trial: "30 days free · no card",
          site: "officeyak.com",

          music: {
            file: "",
            volume: 0.32,
            fadeIn: 0.5,
            fadeOut: 1.2,
            startAt: 0,
            loop: true,
          },
          voice: {
            file: "",
            volume: 1,
            fadeIn: 0.1,
            fadeOut: 0.3,
            startAt: 0,
            loop: false,
          },
          timing: { load: 4.2, mark: 2.8, yak: 3.8, peaks: 3.6, proof: 3.4, close: 3.6 },
        }}
        calculateMetadata={({ props }) => ({
          durationInFrames: oyLayout(props.timing, OY_FPS).total,
        })}
        fps={OY_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
