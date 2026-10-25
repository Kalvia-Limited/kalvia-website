import Image from "next/image";
import { ArchRipple } from "@/components/ui/arch-ripple";
import { Header, CycleSection, ProsperitySection, OfferingsSection, JourneySection, FinderSection } from "./interactive-sections";
import { SiteInteractions, Reveal, RotatingHeadline, Counter, SealMovement, MotionControl } from "./interactions";
import { ValuesWall } from "./interactive-content";
import { SealDemo } from "./seal-demo";
import { ContactForm } from "./contact-form";
export function Homepage() { return (<SiteInteractions>
<a className="skip-link" href="#main-content">Skip to content</a>
<svg width="0" height="0" style={{position: "absolute"}} aria-hidden="true">
  <symbol id="k-mark" fill="currentColor" viewBox="241 495 75.2 93.1"><path d="M 278.58 495 C 299.33 495 316.16 511.82 316.16 532.57 L 316.16 577.03 C 316.16 583.14 311.21 588.09 305.10 588.09 L 252.05 588.09 C 245.94 588.09 241 583.14 241 577.03 L 241 532.57 C 241 511.82 257.82 495 278.58 495 Z M 278.58 501.49 C 261.41 501.49 247.49 515.41 247.49 532.57 L 247.49 577.03 C 247.49 579.55 249.53 581.60 252.05 581.60 L 305.10 581.60 C 307.62 581.60 309.67 579.55 309.67 577.03 L 309.67 532.57 C 309.67 515.41 295.75 501.49 278.58 501.49 Z M 278.56 564.90 C 284.14 564.90 290.71 566.23 295.69 567.49 L 296.16 567.61 C 298.49 568.20 300.52 568.79 302 569.24 L 302.55 569.41 C 303.08 569.57 303.52 569.71 303.85 569.82 L 304.35 569.98 C 304.41 570.00 304.48 570.03 304.5 570.03 C 304.50 570.03 304.51 570.03 304.51 570.04 L 304.53 570.04 L 304.55 570.05 L 304.56 570.05 C 306.54 570.73 307.62 572.87 307.00 574.86 L 306.97 574.95 C 306.28 576.96 304.11 578.04 302.10 577.38 L 302.07 577.37 L 302.04 577.36 C 302.04 577.36 302.03 577.36 302.03 577.36 C 302.01 577.35 301.97 577.33 301.92 577.32 C 301.82 577.29 301.67 577.24 301.47 577.17 C 301.07 577.05 300.48 576.86 299.75 576.64 C 298.26 576.18 296.19 575.58 293.80 574.98 C 288.95 573.76 283.15 572.62 278.56 572.62 C 274.12 572.62 268.53 573.69 263.78 574.87 L 263.32 574.98 C 260.94 575.58 258.86 576.18 257.38 576.64 L 257.37 576.64 C 256.64 576.86 256.05 577.05 255.65 577.17 C 255.45 577.24 255.30 577.29 255.19 577.32 L 255.08 577.36 L 255.07 577.36 L 255.06 577.37 L 255.04 577.37 C 253.02 578.05 250.84 576.97 250.16 574.95 C 249.47 572.94 250.54 570.76 252.55 570.06 L 252.58 570.05 L 252.61 570.04 C 252.62 570.03 252.62 570.03 252.62 570.03 C 252.64 570.03 252.71 570.00 252.76 569.98 C 252.88 569.94 253.05 569.89 253.27 569.82 C 253.71 569.68 254.34 569.48 255.13 569.24 C 256.70 568.76 258.90 568.12 261.43 567.49 C 266.42 566.23 272.98 564.90 278.56 564.90 Z M 302.20 546.50 C 304.24 545.89 306.39 547.05 307.01 549.09 L 307.04 549.19 C 307.58 551.20 306.43 553.30 304.42 553.91 L 279.66 561.33 L 279.64 561.33 L 279.43 561.39 L 279.41 561.40 C 278.79 561.53 278.15 561.52 277.54 561.35 L 252.79 554.55 C 250.73 553.98 249.52 551.85 250.09 549.80 L 250.12 549.70 C 250.72 547.70 252.82 546.54 254.84 547.10 L 278.51 553.60 Z M 278.52 531.03 C 282.96 531.03 286.57 534.63 286.57 539.07 C 286.57 543.51 282.96 547.11 278.52 547.11 C 274.08 547.11 270.48 543.51 270.48 539.07 C 270.48 534.63 274.08 531.03 278.52 531.03 Z M 278.53 507.83 C 279.76 507.83 280.89 507.83 281.71 507.84 C 282.12 507.85 282.46 507.85 282.70 507.85 C 282.82 507.85 282.92 507.86 283 507.86 C 283.03 507.86 283.08 507.86 283.12 507.87 C 283.14 507.87 283.18 507.87 283.23 507.88 C 283.25 507.88 283.31 507.89 283.38 507.91 C 283.41 507.91 283.49 507.93 283.57 507.96 C 283.61 507.97 283.82 508.05 284.03 508.23 L 284.12 508.31 L 284.23 508.43 C 284.42 508.66 284.5 508.89 284.51 508.93 C 284.53 509.01 284.55 509.07 284.55 509.10 C 284.57 509.17 284.58 509.22 284.58 509.25 C 284.58 509.30 284.59 509.35 284.59 509.37 C 284.59 509.43 284.60 509.50 284.60 509.57 C 284.60 509.71 284.60 509.89 284.61 510.12 C 284.61 510.56 284.62 511.16 284.62 511.82 C 284.62 512.45 284.63 513.08 284.65 513.60 C 284.66 513.86 284.67 514.08 284.68 514.25 C 284.69 514.39 284.70 514.45 284.70 514.47 C 284.89 515.44 285.79 516.37 286.83 516.60 C 287.48 516.75 288.41 516.57 288.96 516.21 C 288.97 516.20 289.02 516.16 289.11 516.08 C 289.23 515.97 289.39 515.83 289.58 515.65 C 289.96 515.30 290.44 514.84 290.91 514.37 L 292.68 512.62 L 292.80 512.51 C 293.41 512.03 294.29 512.06 294.86 512.62 L 301.23 518.92 C 301.53 519.21 301.69 519.61 301.69 520.02 C 301.69 520.43 301.53 520.83 301.23 521.12 L 299.46 522.87 C 298.99 523.34 298.53 523.81 298.17 524.19 C 297.99 524.37 297.84 524.53 297.73 524.66 C 297.62 524.78 297.59 524.82 297.60 524.80 C 297.51 524.93 297.40 525.17 297.30 525.48 C 297.20 525.80 297.16 526.08 297.16 526.24 C 297.16 527.41 298.01 528.57 299.16 528.93 C 299.18 528.94 299.22 528.94 299.29 528.95 C 299.42 528.96 299.61 528.98 299.86 528.99 C 300.35 529.02 301.03 529.03 301.89 529.04 C 302.62 529.05 303.29 529.06 303.79 529.07 C 304.03 529.08 304.25 529.08 304.40 529.09 C 304.48 529.10 304.56 529.10 304.64 529.11 C 304.67 529.12 304.74 529.12 304.82 529.14 C 304.85 529.15 304.96 529.17 305.08 529.22 C 305.14 529.24 305.28 529.30 305.44 529.41 C 305.55 529.49 305.90 529.77 306.03 530.30 L 306.05 530.41 L 306.07 530.57 C 306.07 530.59 306.07 530.61 306.07 530.62 C 306.07 530.62 306.07 530.63 306.07 530.64 C 306.07 530.64 306.07 530.65 306.07 530.66 C 306.07 530.66 306.07 530.67 306.07 530.69 L 306.07 531.11 C 306.07 531.35 306.07 531.67 306.07 532.07 C 306.08 532.13 306.09 532.20 306.09 532.26 L 306.09 539.69 C 306.09 540.39 305.62 541.00 304.94 541.18 L 294.03 544.04 C 293.50 544.18 292.94 544.03 292.56 543.66 C 292.17 543.28 292.01 542.73 292.12 542.20 C 292.36 541.19 292.48 540.14 292.48 539.07 C 292.48 531.38 286.25 525.15 278.56 525.15 C 270.87 525.15 264.64 531.38 264.64 539.07 C 264.64 540.15 264.76 541.19 264.99 542.20 C 265.11 542.73 264.95 543.28 264.56 543.66 C 264.17 544.03 263.62 544.18 263.09 544.04 L 252.18 541.18 C 251.50 541.00 251.03 540.39 251.03 539.69 L 251.03 532.26 C 251.03 532.23 251.03 532.20 251.03 532.17 L 251.03 530.60 C 251.03 530.19 251.19 529.79 251.48 529.50 C 251.77 529.21 252.17 529.05 252.58 529.05 L 255.01 529.05 L 255.98 529.05 C 256.29 529.04 256.58 529.03 256.85 529.02 C 257.12 529.01 257.34 529.00 257.51 528.99 C 257.66 528.98 257.74 528.97 257.75 528.97 C 258.77 528.77 259.67 527.91 259.89 526.88 C 260.05 526.16 259.89 525.32 259.53 524.80 C 259.52 524.79 259.48 524.75 259.40 524.66 C 259.29 524.53 259.14 524.37 258.96 524.19 C 258.60 523.81 258.14 523.34 257.66 522.87 L 255.89 521.12 C 255.60 520.83 255.43 520.43 255.43 520.02 C 255.44 519.61 255.60 519.21 255.89 518.92 L 262.26 512.63 C 262.86 512.04 263.82 512.03 264.42 512.62 L 266.39 514.51 L 267.14 515.23 C 267.77 515.83 268.10 516.12 268.35 516.30 C 268.53 516.42 268.60 516.46 269.12 516.56 C 270.64 516.87 272.15 515.84 272.44 514.41 C 272.44 514.39 272.45 514.32 272.45 514.21 C 272.46 514.05 272.48 513.83 272.48 513.57 C 272.50 513.06 272.51 512.42 272.51 511.78 L 272.51 509.38 C 272.51 508.97 272.67 508.57 272.96 508.28 C 273.25 508 273.65 507.83 274.06 507.83 Z M 278.53 507.83 "/></symbol>
  <symbol id="k-logo" fill="currentColor" viewBox="241 495 260.2 93.1"><path d="M 278.58 495 C 299.33 495 316.16 511.82 316.16 532.57 L 316.16 577.03 C 316.16 583.14 311.21 588.09 305.10 588.09 L 252.05 588.09 C 245.94 588.09 241 583.14 241 577.03 L 241 532.57 C 241 511.82 257.82 495 278.58 495 Z M 278.58 501.49 C 261.41 501.49 247.49 515.41 247.49 532.57 L 247.49 577.03 C 247.49 579.55 249.53 581.60 252.05 581.60 L 305.10 581.60 C 307.62 581.60 309.67 579.55 309.67 577.03 L 309.67 532.57 C 309.67 515.41 295.75 501.49 278.58 501.49 Z M 278.56 564.90 C 284.14 564.90 290.71 566.23 295.69 567.49 L 296.16 567.61 C 298.49 568.20 300.52 568.79 302 569.24 L 302.55 569.41 C 303.08 569.57 303.52 569.71 303.85 569.82 L 304.35 569.98 C 304.41 570.00 304.48 570.03 304.5 570.03 C 304.50 570.03 304.51 570.03 304.51 570.04 L 304.53 570.04 L 304.55 570.05 L 304.56 570.05 C 306.54 570.73 307.62 572.87 307.00 574.86 L 306.97 574.95 C 306.28 576.96 304.11 578.04 302.10 577.38 L 302.07 577.37 L 302.04 577.36 C 302.04 577.36 302.03 577.36 302.03 577.36 C 302.01 577.35 301.97 577.33 301.92 577.32 C 301.82 577.29 301.67 577.24 301.47 577.17 C 301.07 577.05 300.48 576.86 299.75 576.64 C 298.26 576.18 296.19 575.58 293.80 574.98 C 288.95 573.76 283.15 572.62 278.56 572.62 C 274.12 572.62 268.53 573.69 263.78 574.87 L 263.32 574.98 C 260.94 575.58 258.86 576.18 257.38 576.64 L 257.37 576.64 C 256.64 576.86 256.05 577.05 255.65 577.17 C 255.45 577.24 255.30 577.29 255.19 577.32 L 255.08 577.36 L 255.07 577.36 L 255.06 577.37 L 255.04 577.37 C 253.02 578.05 250.84 576.97 250.16 574.95 C 249.47 572.94 250.54 570.76 252.55 570.06 L 252.58 570.05 L 252.61 570.04 C 252.62 570.03 252.62 570.03 252.62 570.03 C 252.64 570.03 252.71 570.00 252.76 569.98 C 252.88 569.94 253.05 569.89 253.27 569.82 C 253.71 569.68 254.34 569.48 255.13 569.24 C 256.70 568.76 258.90 568.12 261.43 567.49 C 266.42 566.23 272.98 564.90 278.56 564.90 Z M 302.20 546.50 C 304.24 545.89 306.39 547.05 307.01 549.09 L 307.04 549.19 C 307.58 551.20 306.43 553.30 304.42 553.91 L 279.66 561.33 L 279.64 561.33 L 279.43 561.39 L 279.41 561.40 C 278.79 561.53 278.15 561.52 277.54 561.35 L 252.79 554.55 C 250.73 553.98 249.52 551.85 250.09 549.80 L 250.12 549.70 C 250.72 547.70 252.82 546.54 254.84 547.10 L 278.51 553.60 Z M 278.52 531.03 C 282.96 531.03 286.57 534.63 286.57 539.07 C 286.57 543.51 282.96 547.11 278.52 547.11 C 274.08 547.11 270.48 543.51 270.48 539.07 C 270.48 534.63 274.08 531.03 278.52 531.03 Z M 278.53 507.83 C 279.76 507.83 280.89 507.83 281.71 507.84 C 282.12 507.85 282.46 507.85 282.70 507.85 C 282.82 507.85 282.92 507.86 283 507.86 C 283.03 507.86 283.08 507.86 283.12 507.87 C 283.14 507.87 283.18 507.87 283.23 507.88 C 283.25 507.88 283.31 507.89 283.38 507.91 C 283.41 507.91 283.49 507.93 283.57 507.96 C 283.61 507.97 283.82 508.05 284.03 508.23 L 284.12 508.31 L 284.23 508.43 C 284.42 508.66 284.5 508.89 284.51 508.93 C 284.53 509.01 284.55 509.07 284.55 509.10 C 284.57 509.17 284.58 509.22 284.58 509.25 C 284.58 509.30 284.59 509.35 284.59 509.37 C 284.59 509.43 284.60 509.50 284.60 509.57 C 284.60 509.71 284.60 509.89 284.61 510.12 C 284.61 510.56 284.62 511.16 284.62 511.82 C 284.62 512.45 284.63 513.08 284.65 513.60 C 284.66 513.86 284.67 514.08 284.68 514.25 C 284.69 514.39 284.70 514.45 284.70 514.47 C 284.89 515.44 285.79 516.37 286.83 516.60 C 287.48 516.75 288.41 516.57 288.96 516.21 C 288.97 516.20 289.02 516.16 289.11 516.08 C 289.23 515.97 289.39 515.83 289.58 515.65 C 289.96 515.30 290.44 514.84 290.91 514.37 L 292.68 512.62 L 292.80 512.51 C 293.41 512.03 294.29 512.06 294.86 512.62 L 301.23 518.92 C 301.53 519.21 301.69 519.61 301.69 520.02 C 301.69 520.43 301.53 520.83 301.23 521.12 L 299.46 522.87 C 298.99 523.34 298.53 523.81 298.17 524.19 C 297.99 524.37 297.84 524.53 297.73 524.66 C 297.62 524.78 297.59 524.82 297.60 524.80 C 297.51 524.93 297.40 525.17 297.30 525.48 C 297.20 525.80 297.16 526.08 297.16 526.24 C 297.16 527.41 298.01 528.57 299.16 528.93 C 299.18 528.94 299.22 528.94 299.29 528.95 C 299.42 528.96 299.61 528.98 299.86 528.99 C 300.35 529.02 301.03 529.03 301.89 529.04 C 302.62 529.05 303.29 529.06 303.79 529.07 C 304.03 529.08 304.25 529.08 304.40 529.09 C 304.48 529.10 304.56 529.10 304.64 529.11 C 304.67 529.12 304.74 529.12 304.82 529.14 C 304.85 529.15 304.96 529.17 305.08 529.22 C 305.14 529.24 305.28 529.30 305.44 529.41 C 305.55 529.49 305.90 529.77 306.03 530.30 L 306.05 530.41 L 306.07 530.57 C 306.07 530.59 306.07 530.61 306.07 530.62 C 306.07 530.62 306.07 530.63 306.07 530.64 C 306.07 530.64 306.07 530.65 306.07 530.66 C 306.07 530.66 306.07 530.67 306.07 530.69 L 306.07 531.11 C 306.07 531.35 306.07 531.67 306.07 532.07 C 306.08 532.13 306.09 532.20 306.09 532.26 L 306.09 539.69 C 306.09 540.39 305.62 541.00 304.94 541.18 L 294.03 544.04 C 293.50 544.18 292.94 544.03 292.56 543.66 C 292.17 543.28 292.01 542.73 292.12 542.20 C 292.36 541.19 292.48 540.14 292.48 539.07 C 292.48 531.38 286.25 525.15 278.56 525.15 C 270.87 525.15 264.64 531.38 264.64 539.07 C 264.64 540.15 264.76 541.19 264.99 542.20 C 265.11 542.73 264.95 543.28 264.56 543.66 C 264.17 544.03 263.62 544.18 263.09 544.04 L 252.18 541.18 C 251.50 541.00 251.03 540.39 251.03 539.69 L 251.03 532.26 C 251.03 532.23 251.03 532.20 251.03 532.17 L 251.03 530.60 C 251.03 530.19 251.19 529.79 251.48 529.50 C 251.77 529.21 252.17 529.05 252.58 529.05 L 255.01 529.05 L 255.98 529.05 C 256.29 529.04 256.58 529.03 256.85 529.02 C 257.12 529.01 257.34 529.00 257.51 528.99 C 257.66 528.98 257.74 528.97 257.75 528.97 C 258.77 528.77 259.67 527.91 259.89 526.88 C 260.05 526.16 259.89 525.32 259.53 524.80 C 259.52 524.79 259.48 524.75 259.40 524.66 C 259.29 524.53 259.14 524.37 258.96 524.19 C 258.60 523.81 258.14 523.34 257.66 522.87 L 255.89 521.12 C 255.60 520.83 255.43 520.43 255.43 520.02 C 255.44 519.61 255.60 519.21 255.89 518.92 L 262.26 512.63 C 262.86 512.04 263.82 512.03 264.42 512.62 L 266.39 514.51 L 267.14 515.23 C 267.77 515.83 268.10 516.12 268.35 516.30 C 268.53 516.42 268.60 516.46 269.12 516.56 C 270.64 516.87 272.15 515.84 272.44 514.41 C 272.44 514.39 272.45 514.32 272.45 514.21 C 272.46 514.05 272.48 513.83 272.48 513.57 C 272.50 513.06 272.51 512.42 272.51 511.78 L 272.51 509.38 C 272.51 508.97 272.67 508.57 272.96 508.28 C 273.25 508 273.65 507.83 274.06 507.83 Z M 278.53 507.83 "/><path d="M 337.60 565.71 L 337.60 522.78 L 344.72 522.78 L 344.72 540.76 C 348.08 540.76 351.01 540.03 353.51 538.59 C 356.00 537.11 357.98 535.03 359.43 532.35 C 360.89 529.68 361.72 526.49 361.93 522.78 L 369.54 522.78 C 369.5 525.01 369.04 527.25 368.16 529.51 C 367.33 531.74 366.23 533.82 364.86 535.75 C 363.49 537.69 361.99 539.35 360.37 540.76 C 358.75 542.16 357.13 543.12 355.51 543.66 C 358.12 544.48 360.53 545.90 362.74 547.92 C 364.98 549.90 366.83 552.39 368.29 555.39 C 369.75 558.40 370.62 561.83 370.91 565.71 L 363.30 565.71 C 363.05 561.63 362.10 558.19 360.43 555.39 C 358.81 552.55 356.65 550.39 353.94 548.91 C 351.28 547.42 348.21 546.69 344.72 546.69 L 344.72 565.71 Z M 337.60 565.71 "/><path d="M 385.57 566.14 C 382.58 566.14 379.86 565.42 377.41 563.98 C 374.99 562.5 373.06 560.46 371.60 557.86 C 370.19 555.23 369.48 552.16 369.48 548.66 C 369.48 545.16 370.19 542.12 371.60 539.52 C 373.06 536.89 374.99 534.85 377.41 533.41 C 379.86 531.96 382.58 531.25 385.57 531.25 C 388.40 531.25 390.87 531.94 393 533.34 C 395.12 534.70 396.65 536.60 397.61 539.03 L 397.61 531.67 L 404.78 531.67 L 404.78 565.71 L 401.60 565.71 C 400.44 565.71 399.48 565.33 398.73 564.60 C 397.98 563.85 397.61 562.91 397.61 561.75 L 397.61 558.30 C 396.65 560.73 395.12 562.64 393 564.04 C 390.87 565.44 388.40 566.14 385.57 566.14 Z M 387.19 560.03 C 388.98 560.03 390.67 559.59 392.25 558.73 C 393.83 557.86 395.12 556.59 396.11 554.90 C 397.11 553.17 397.61 551.09 397.61 548.66 C 397.61 546.19 397.11 544.13 396.11 542.48 C 395.12 540.80 393.83 539.52 392.25 538.66 C 390.67 537.79 388.98 537.36 387.19 537.36 C 385.45 537.36 383.76 537.79 382.14 538.66 C 380.56 539.52 379.28 540.80 378.28 542.48 C 377.28 544.13 376.78 546.19 376.78 548.66 C 376.78 551.09 377.28 553.17 378.28 554.90 C 379.28 556.59 380.56 557.86 382.14 558.73 C 383.76 559.59 385.45 560.03 387.19 560.03 Z M 387.19 560.03 "/><path d="M 407.92 557.92 L 407.92 522.63 L 415.03 522.63 L 415.03 557.31 C 415.03 558.21 415.30 558.91 415.85 559.41 C 416.39 559.90 417.03 560.15 417.78 560.15 C 418.28 560.15 418.71 560.07 419.09 559.90 L 420.58 565.09 C 419.38 565.79 417.94 566.14 416.28 566.14 C 414.95 566.14 413.64 565.87 412.35 565.33 C 411.07 564.76 410.00 563.87 409.17 562.68 C 408.34 561.44 407.92 559.86 407.92 557.92 Z M 407.92 557.92 "/><path d="M 425.69 531.67 L 435.42 559.41 L 445.15 531.67 L 452.69 531.67 L 439.60 565.71 L 431.12 565.71 L 418.08 531.67 Z M 425.69 531.67 "/><path d="M 455.74 565.71 L 455.74 531.67 L 462.85 531.67 L 462.85 565.71 Z M 455.74 565.71 "/><path d="M 481.90 566.14 C 478.91 566.14 476.18 565.42 473.73 563.98 C 471.32 562.5 469.39 560.46 467.93 557.86 C 466.52 555.23 465.81 552.16 465.81 548.66 C 465.81 545.16 466.52 542.12 467.93 539.52 C 469.39 536.89 471.32 534.85 473.73 533.41 C 476.18 531.96 478.91 531.25 481.90 531.25 C 484.73 531.25 487.20 531.94 489.32 533.34 C 491.44 534.70 492.98 536.60 493.94 539.03 L 493.94 531.67 L 501.11 531.67 L 501.11 565.71 L 497.93 565.71 C 496.76 565.71 495.81 565.33 495.06 564.60 C 494.31 563.85 493.94 562.91 493.94 561.75 L 493.94 558.30 C 492.98 560.73 491.44 562.64 489.32 564.04 C 487.20 565.44 484.73 566.14 481.90 566.14 Z M 483.52 560.03 C 485.31 560.03 487 559.59 488.57 558.73 C 490.16 557.86 491.44 556.59 492.44 554.90 C 493.44 553.17 493.94 551.09 493.94 548.66 C 493.94 546.19 493.44 544.13 492.44 542.48 C 491.44 540.80 490.16 539.52 488.57 538.66 C 487 537.79 485.31 537.36 483.52 537.36 C 481.78 537.36 480.09 537.79 478.47 538.66 C 476.89 539.52 475.60 540.80 474.60 542.48 C 473.61 544.13 473.11 546.19 473.11 548.66 C 473.11 551.09 473.61 553.17 474.60 554.90 C 475.60 556.59 476.89 557.86 478.47 558.73 C 480.09 559.59 481.78 560.03 483.52 560.03 Z M 483.52 560.03 "/><path d="M 463.75 524.71 C 463.75 527.14 461.78 529.11 459.35 529.11 C 456.92 529.11 454.95 527.14 454.95 524.71 C 454.95 522.28 456.92 520.31 459.35 520.31 C 461.78 520.31 463.75 522.28 463.75 524.71 Z M 463.75 524.71 "/></symbol>
</svg>

<Header />

<main id="main-content" tabIndex={-1}>


<section className="hero" aria-labelledby="hero-title">
  <div className="wrap hero-grid">
    <div className="hero-copy">
      <span className="eyebrow">Kalvia · Lagos, Nigeria</span>
      <h1 id="hero-title">Africa&apos;s next class of
        {" "}<RotatingHeadline />{" "}
        starts here!</h1>
      <p className="hero-lede">We train people who can build, manage, and lead: technically capable on the worksite, professionally equipped at the client meeting.</p>
      <div className="hero-actions">
        <a className="btn btn-orange" href="#finder">Get started <span className="arrow">→</span></a>
        <a className="btn btn-ghost" href="#about">Why Kalvia</a>
        <MotionControl />
      </div>
    </div>
    <div className="hero-visual">
      <ArchRipple id="hero-ripple" className="ripple" />
      <div className="hero-arch arch" aria-hidden="true"></div>
      <Image className="hero-photo" preload sizes="(max-width: 680px) 115vw, (max-width: 920px) 720px, (max-width: 1200px) 65vw, 690px" src="/assets/hero-team.webp" width={1200} height={689} alt="Three Kalvia trainees in workwear, one holding a power tool" />
      <div className="hero-chip c1"><span className="dot" style={{background: "var(--orange)"}}>✓</span>Certified with SOAT</div>
      <div className="hero-chip c2"><span className="dot" style={{background: "var(--blue-2)"}}>★</span>Business-ready</div>
    </div>
  </div>
  <span className="hero-tag accent" aria-hidden="true">Enabling prosperity!</span>
</section>


<section className="promise" aria-labelledby="promise-title">
  <h2 className="sr-only" id="promise-title">What Kalvia promises</h2>
  <div className="wrap promise-grid">
    <Reveal className="promise-item reveal">
      <span className="ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/></svg></span>
      <div><h3>Mastery, built in</h3><p>Practical, career-relevant training in the trades and the professional skills around them.</p></div>
    </Reveal>
    <Reveal className="promise-item reveal" data-delay="1">
      <span className="ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg></span>
      <div><h3>Trust you can see</h3><p>The SOAT seal gives customers a visible, renewable reason to trust a technician.</p></div>
    </Reveal>
    <Reveal className="promise-item reveal" data-delay="2">
      <span className="ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M3 21h18"/><path d="M12 14v4"/></svg></span>
      <div><h3>Access to opportunity</h3><p>Jobs, clients and the systems to manage them, through Kalvia Marketplace.</p></div>
    </Reveal>
  </div>
</section>

<div className="marquee" aria-hidden="true">
  <div className="marquee-track">
    <span>Mastery</span><span>Ethics</span><span>Access</span><span>Confidence</span><span>Assurance</span><span>Quality</span><span>Growth</span><span>Impact</span>
    <span>Mastery</span><span>Ethics</span><span>Access</span><span>Confidence</span><span>Assurance</span><span>Quality</span><span>Growth</span><span>Impact</span>
  </div>
</div>


<CycleSection />


<ProsperitySection />


<OfferingsSection />


<JourneySection />


<section className="section on-blue" id="soat" tabIndex={-1} aria-labelledby="soat-title">
  <div className="wrap soat-grid">
    <SealMovement>
      <svg className="seal" id="seal" viewBox="0 0 320 380" aria-hidden="true">
        <path d="M160 8 L300 58 V190 C300 280 236 340 160 372 C84 340 20 280 20 190 V58 Z" fill="#FFAE00"/>
        <path d="M160 30 L282 73 V190 C282 268 226 320 160 350 C94 320 38 268 38 190 V73 Z" fill="#170C79"/>
        <g transform="translate(118 74) scale(1.12)" fill="#fff"><svg x="0" y="0" width="75" height="93" viewBox="0 0 75.2 93.1"><use href="#k-mark"/></svg></g>
        <text x="160" y="238" textAnchor="middle" fontFamily="Parkinsans, sans-serif" fontWeight="800" fontSize="58" fill="#FFAE00" letterSpacing="4">SOAT</text>
        <text x="160" y="262" textAnchor="middle" fontFamily="Parkinsans, sans-serif" fontWeight="600" fontSize="9.5" fill="#fff" letterSpacing="1">SEAL OF AUTHORISED TECHNICIAN</text>
        <text x="160" y="290" textAnchor="middle" fontFamily="Parkinsans, sans-serif" fontWeight="700" fontSize="13" fill="#FF5A00" letterSpacing="3">KALVIA CERTIFIED</text>
      </svg>
    </SealMovement>
    <Reveal className="reveal" data-delay="1">
      <div className="section-head" style={{marginBottom: "0"}}>
        <span className="eyebrow">The Kalvian seal</span>
        <h2 id="soat-title">SOAT: trust, made visible.</h2>
        <p>The Seal of Authorised Technician carries the trust Kalvia transfers to a technician, and gives customers a visible reason to trust them. It&apos;s valid for one year; renewal means passing Kalvia&apos;s theory and practical tests again.</p>
      </div>
      <div className="soat-facts">
        <div><Counter end={12} /><span>months of validity per seal</span></div>
        <div><b>2</b><span>tests to renew: theory and practical</span></div>
        <div><b>1</b><span>visible reason to trust</span></div>
      </div>
      <SealDemo />
    </Reveal>
  </div>
</section>


<FinderSection />


<section className="section" style={{paddingTop: "0"}} aria-labelledby="values-title">
  <div className="wrap">
    <Reveal className="section-head reveal">
      <span className="eyebrow">How we behave</span>
      <h2 id="values-title">Six values, built like a perforated wall.</h2>
      <p>Air and light pass through. So do ideas and opportunity. Hover or tap a value to see what it means in practice.</p>
    </Reveal>
    <ValuesWall />
  </div>
</section>


<section className="section" style={{paddingTop: "0"}} aria-label="Kalvia in the field">
  <div className="wrap frames">
    <Reveal as="figure" className="frame reveal" style={{margin: "0"}}><Image src="/assets/machinist.webp" alt="A technician adjusting a machine in a workshop" loading="lazy" decoding="async" sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 760px) 50vw, (max-width: 1200px) 33vw, 360px" width={733} height={1100} /><figcaption>Theory becomes practice</figcaption></Reveal>
    <Reveal as="figure" className="frame reveal" data-delay="1" style={{margin: "0"}}><Image src="/assets/workshop.webp" alt="A carpenter shaping wood with a chisel" loading="lazy" decoding="async" sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 760px) 50vw, (max-width: 1200px) 33vw, 360px" width={733} height={1100} /><figcaption>Respect the work</figcaption></Reveal>
    <Reveal as="figure" className="frame reveal" data-delay="2" style={{margin: "0"}}><Image src="/assets/site.webp" alt="Two professionals in hard hats reviewing work on site" loading="lazy" decoding="async" sizes="(max-width: 560px) calc(100vw - 32px), (max-width: 760px) 100vw, (max-width: 1200px) 33vw, 360px" width={733} height={1100} /><figcaption>Professional on every site</figcaption></Reveal>
  </div>
</section>


<section className="section vision" aria-labelledby="vision-title">
  <ArchRipple id="vision-ripple" className="ripple-bg" count={22} />
  <div className="wrap">
    <Reveal className="section-head reveal" style={{position: "relative", zIndex: 1}}>
      <span className="eyebrow" style={{color: "var(--yellow)"}}>Where we&apos;re going</span>
      <h2 id="vision-title" style={{color: "var(--white)"}}>Beginning in Nigeria. <span className="hl-yellow">Built for the continent.</span></h2>
    </Reveal>
    <div className="vm-grid">
      <Reveal className="vm-card reveal"><span className="k">Our vision</span><p>To establish Africa as a global source of highly skilled, business-ready technical professionals.</p></Reveal>
      <Reveal className="vm-card reveal" data-delay="1"><span className="k">Our mission</span><p>To redefine skilled trades as a prestigious, technology-enabled profession, developing Africa&apos;s most respected generation of artisans.</p></Reveal>
    </div>
    <Reveal className="voice reveal" aria-label="Our tone of voice"><span>Brave.</span><span>Honest.</span><span>Confident.</span><span>Reassuring.</span><span>Informed.</span></Reveal>
  </div>
</section>


<section className="section" id="contact" tabIndex={-1} aria-labelledby="contact-title">
  <div className="wrap">
    <Reveal as="a" className="cta-band reveal" href="#contact-form" style={{marginBottom: "clamp(60px,8vw,100px)"}}><span>start enabling prosperity</span><span className="circle" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></Reveal>
    <div className="contact-grid">
      <Reveal className="contact-info reveal">
        <span className="accent">Say hello!</span>
        <h2 id="contact-title">Let&apos;s build something that lasts.</h2>
        <p>Whether you&apos;re enrolling, sponsoring, hiring or partnering, tell us a little and the right person will get back to you.</p>
        <ul className="contact-list">
          <li><span className="ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/></svg></span><span>hello@kalvia.one</span></li>
          <li><span className="ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>50 Herbert Macaulay Way, Yaba, Lagos, Nigeria</li>
        </ul>
      </Reveal>
      <ContactForm />
    </div>
  </div>
</section>

</main>

<footer>
  <div className="wrap">
    <div className="foot-grid">
      <div>
        <a className="brand" href="#top" aria-label="Kalvia home"><svg viewBox="0 0 260.2 93.1" style={{height: "36px"}}><use href="#k-logo"/></svg></a>
        <p className="foot-tag accent">Enabling prosperity.</p>
      </div>
      <div><h3>Kalvia</h3><ul><li><a href="#academy">Academy</a></li><li><a href="#academy" data-brand="market">Marketplace</a></li><li><a href="#soat">SOAT seal</a></li></ul></div>
      <div><h3>Company</h3><ul><li><a href="#about">About us</a></li><li><a href="#finder">Get started</a></li><li><a href="#contact">Contact</a></li></ul></div>
      <div><h3>Visit</h3><ul><li>50 Herbert Macaulay Way</li><li>Yaba, Lagos, Nigeria</li><li><span>hello@kalvia.one</span></li></ul></div>
    </div>
    <div className="foot-bottom"><span>© <span id="year">2026</span> Kalvia Limited and/or its affiliates. All rights reserved.</span><a href="#top">Back to top ↑</a></div>
  </div>
</footer>


</SiteInteractions>); }
