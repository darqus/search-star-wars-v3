<script setup lang="ts">
import { NON_BREAKING_SPACE } from '@/state/'

type Props = {
  className?: string
  side: string
}

withDefaults(defineProps<Props>(), {
  className: 'left',
})

const items = {
  s1: {
    text: `${NON_BREAKING_SPACE.repeat(3)}΅̮̼˘˼̐`,
    len: 7,
  },
  s2: {
    text: `${NON_BREAKING_SPACE.repeat(
      2
    )};̧΅̮̼<tspan>̧΅</tspan>̃ˬ<tspan>̧</tspan>̧΅̮<tspan>͒̈́</tspan>`,
    len: 7,
  },
  s3: {
    text: `˘˼̐˶̨̰̼̃͂̏̑̉̆${NON_BREAKING_SPACE.repeat(2)}`,
    len: 6,
  },
  s4: {
    text: `${NON_BREAKING_SPACE.repeat(3)} ͒̈́'`,
    len: 7,
  },
  s5: {
    text: 'ˠ˞˟˷̐˽̘̖̫̫̭̮̔',
    len: 15,
  },
}
</script>

<template>
  <div
    :class="`${className} ${side}`"
    aria-hidden="true"
    class="mandala-container animate-colors"
  >
    <div
      :class="className === 'right' ? 'rotate-right' : 'rotate-left'"
      class="mandala-translate"
    >
      <svg
        class="mandala"
        fill="none"
        height="675"
        viewBox="0 0 675 675"
        width="675"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="circle1"
            d="M337.5,337.5 m-320,0 a320,320 0 1,1 640,0 a320,320 0 1,1 -640,0"
          />
          <path
            id="circle2"
            d="M337.5,337.5 m-280,0 a280,280 0 1,1 560,0 a280,280 0 1,1 -560,0"
          />
          <path
            id="circle3"
            d="M337.5,337.5 m-240,0 a240,240 0 1,1 480,0 a240,240 0 1,1 -480,0"
          />
          <path
            id="circle4"
            d="M337.5,337.5 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"
          />
          <path
            id="circle5"
            d="M337.5,337.5 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
          />
        </defs>
        <text
          class="mandala-accent-1"
          dy="70"
          textLength="2010"
        >
          <animateTransform
            attributeName="transform"
            begin="0s"
            dur="500s"
            from="0 337.5 337.5"
            repeatCount="indefinite"
            to="360 337.5 337.5"
            type="rotate"
          />
          <textPath
            href="#circle1"
            textLength="2010"
          >
            <tspan
              v-for="s1 in items.s1.len"
              :key="s1"
              v-html="items.s1.text"
            />
          </textPath>
        </text>
        <text
          class="mandala-accent-2"
          dy="70"
          textLength="1760"
        >
          <animateTransform
            attributeName="transform"
            begin="0s"
            dur="500s"
            from="360 337.5 337.5"
            repeatCount="indefinite"
            to="0 337.5 337.5"
            type="rotate"
          />
          <textPath
            href="#circle2"
            textLength="1760"
          >
            <tspan
              v-for="s2 in items.s2.len"
              :key="s2"
              v-html="items.s2.text"
            />
          </textPath>
        </text>
        <text
          class="mandala-accent-3"
          dy="70"
          textLength="1507"
        >
          <animateTransform
            attributeName="transform"
            begin="0s"
            dur="500s"
            from="0 337.5 337.5"
            repeatCount="indefinite"
            to="360 337.5 337.5"
            type="rotate"
          />
          <textPath
            href="#circle3"
            textLength="1507"
          >
            <tspan
              v-for="s3 in items.s3.len"
              :key="s3"
              v-html="items.s3.text"
            />
          </textPath>
        </text>
        <text
          class="mandala-accent-4"
          dy="70"
          textLength="1257"
        >
          <animateTransform
            attributeName="transform"
            begin="0s"
            dur="500s"
            from="360 337.5 337.5"
            repeatCount="indefinite"
            to="0 337.5 337.5"
            type="rotate"
          />
          <textPath
            href="#circle4"
            textLength="1257"
          >
            <tspan
              v-for="s4 in items.s4.len"
              :key="s4"
              v-html="items.s4.text"
            />
          </textPath>
        </text>
        <text
          class="mandala-accent-5"
          dy="70"
          textLength="1005"
        >
          <animateTransform
            attributeName="transform"
            begin="0s"
            dur="500s"
            from="0 337.5 337.5"
            repeatCount="indefinite"
            to="360 337.5 337.5"
            type="rotate"
          />
          <textPath
            href="#circle5"
            textLength="1005"
          >
            <tspan
              v-for="s5 in items.s5.len"
              :key="s5"
              v-html="items.s5.text"
            />
          </textPath>
        </text>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.mandala-container {
  --mandala-primary: #ae8acf;
  --mandala-accent-1: #9b5ed8;
  --mandala-accent-2: #cb51db;
  --mandala-accent-3: #c75bc9;
  --mandala-accent-4: #7144c5;

  position: absolute;
  top: -20vh;
  overflow: hidden;
  opacity: 0.4;
}

.mandala-container.dark {
  --mandala-primary: #665675;
  --mandala-accent-1: #a673da;
  --mandala-accent-2: #9e66d3;
  --mandala-accent-3: #c17ac4;
  --mandala-accent-4: #b367b6;
}

.mandala-container.left {
  right: -150px;
}

.mandala-container.right {
  left: -150px;
}

@keyframes rotation-left {
  from {
    transform: rotate(360deg);
  }

  to {
    transform: rotate(0deg);
  }
}

@keyframes rotation-right {
  from {
    transform: rotate(180deg);
  }

  to {
    transform: rotate(-180deg);
  }
}

.mandala-container svg {
  font-size: 1.5rem;
  font-weight: 300;
  user-select: none;
}

.mandala-container .rotate-left > svg {
  animation: rotation-left 200s linear infinite;
}

.mandala-container .rotate-right > svg {
  animation: rotation-right 200s linear infinite;
}

.mandala-container svg > text {
  fill: var(--mandala-primary);
}

.mandala-container .mandala-accent-1 {
  font-size: 1.5rem;
}

.mandala-container .mandala-accent-2 {
  font-size: 1.3rem;
}

.mandala-container .mandala-accent-3 {
  font-size: 1.2rem;
}

.mandala-container .mandala-accent-4 {
  font-size: 1.1rem;
}

.mandala-container .mandala-accent-5 {
  font-size: 1rem;
}

.mandala-container.animate-colors svg > text > textPath > tspan {
  fill: var(--mandala-primary);
  animation: mandala-color-change 50s infinite;
  animation-timing-function: ease-in-out;
}

.mandala-container.animate-colors .mandala-accent-1 > textPath > tspan {
  fill: var(--mandala-accent-1);
  animation-delay: -15s;
}

.mandala-container.animate-colors .mandala-accent-2 > textPath > tspan {
  fill: var(--mandala-accent-2);
  animation-delay: -20s;
}

.mandala-container.animate-colors .mandala-accent-3 > textPath > tspan {
  fill: var(--mandala-accent-3);
  animation-delay: -30s;
}

.mandala-container.animate-colors .mandala-accent-5 > textPath > tspan {
  fill: var(--mandala-accent-4);
  animation-delay: -40s;
}

@keyframes mandala-color-change {
  0% {
    fill: var(--mandala-primary);
  }

  10% {
    fill: var(--mandala-primary);
  }

  15% {
    fill: var(--mandala-accent-1);
  }

  20% {
    fill: var(--mandala-primary);
  }

  25% {
    fill: var(--mandala-primary);
  }

  30% {
    fill: var(--mandala-accent-2);
  }

  35% {
    fill: var(--mandala-primary);
  }

  40% {
    fill: var(--mandala-primary);
  }

  50% {
    fill: var(--mandala-accent-3);
  }

  55% {
    fill: var(--mandala-primary);
  }

  60% {
    fill: var(--mandala-primary);
  }

  65% {
    fill: var(--mandala-accent-4);
  }

  70% {
    fill: var(--mandala-primary);
  }

  100% {
    fill: var(--mandala-primary);
  }
}
</style>
