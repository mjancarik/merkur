import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Flexible',
    description: (
      <>
        You can pick your favorite framework(Vue, Angular, Ember) or templating
        engine(Preact, uhtml, Svelte, vanilla).
      </>
    ),
  },
  {
    title: 'Usable',
    description: (
      <>
        Merkur widgets work with a multi - page application built with jQuery or
        a single - page application, as well as an isomorphic application.
      </>
    ),
  },
  {
    title: 'SSR - ready',
    description: (
      <>
        Website load time is a critical usability factor for your users. Merkur
        speeds up loading by including server - side rendering out of the box.
      </>
    ),
  },
  {
    title: 'Extensible',
    description: (
      <>
        All base functionality is defined as plugins, and adding your own is a
        matter of creating a single file.
      </>
    ),
  },
  {
    title: 'Configurable',
    description: (
      <>
        You have control over merkur.config.mjs file to set build, devServer,
        server, etc.
      </>
    ),
  },
  {
    title: 'Tiny',
    description: <>Merkur is less than 1, 2 kB minified + gzipped.</>,
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center padding-horiz--md'>
        <Heading as='h3'>{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
