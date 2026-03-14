import './style.css';
import { Game } from './modules/game.js';

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const overlayEl = document.getElementById('overlay');

const game = new Game({
  canvas,
  scoreEl,
  livesEl,
  waveEl,
  overlayEl
});

game.start();
