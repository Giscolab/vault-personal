import { renderSecurityChart } from './security-chart.js';

document.addEventListener('DOMContentLoaded', () => {
  renderSecurityChart('securityChart', {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    scores: [65, 59, 70, 71, 66, 65, 73, 72, 75, 74, 73, 73], // à remplacer par tes stats réelles si besoin
    weak: [24, 22, 20, 18, 19, 17, 16, 15, 14, 16, 16, 16]
  });
});
