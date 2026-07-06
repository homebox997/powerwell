/* Nav toggle — deferred load */
function toggleMenu() { document.getElementById('navMenu').classList.toggle('open'); }
document.addEventListener('click', function(e) {
    var nav = document.getElementById('navMenu');
    var hamburger = document.querySelector('.hamburger');
    if (nav && hamburger && nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('open');
    }
});
