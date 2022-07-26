import Head from 'next/head';
import Image from 'next/image';
import type { NextPage } from 'next';

import Layout from '../components/Layout';
import Prose from '../components/Prose';
import Mint from '../components/Mint';
import Faq from '../components/Faq';
import Team from '../components/Team';
import Roadmap from '../components/Roadmap';
import topImage from '../public/assets/1920x600.png';
import contractConfig from '../config/contract-config.json';

const Home: NextPage = () => {
  const { nftName } = contractConfig;

  return (
    <Layout>
      <Head>
        <title>{nftName}</title>
      </Head>

      <Image src={topImage} alt={nftName} />

      <div className="bg-gray-800 py-16">
        <Prose>
          <h1 className="text-5xl font-bold mb-4">{nftName}</h1>

          <p className="text-xl">
          GDM is a collection of 1,000,000 Lucky Dollar Metaverse NFTs, unique digital collectibles living on the Ethereum blockchain.

•Your lucky dollar works as a membership card and provides access to benefits for members only, the first of which is access to a private raffle with multiple benefits.

•Future areas and benefits can be unlocked by the community by activating the roadmap.
          </p>
        </Prose>
      </div>

      <div className="py-16">
        <Prose>
          <Mint />
        </Prose>
      </div>

      <div className="bg-gray-800 py-16">
        <Prose>
          <Faq />
        </Prose>
      </div>

      <div className="py-16">
        <Prose>
          <Roadmap />
        </Prose>
      </div>

      <div className="bg-gray-800 py-16">
        <Prose>
          <Team />
        </Prose>
      </div>
    </Layout>
  );
};

export default Home;
