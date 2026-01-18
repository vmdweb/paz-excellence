/**
 * Contact Module (Atualizado)
 * Janela flutuante centralizada para contato
 */

let contactOverlay = null;
let contactContent = null;

function initContact() {
    contactOverlay = document.getElementById('contactOverlay');
    contactContent = document.getElementById('contactContent'); // container interno para centralização

    const closeBtn = document.getElementById('contactClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeContact);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactOverlay && contactOverlay.classList.contains('active')) {
            closeContact();
        }
    });

    if (contactOverlay) {
        contactOverlay.addEventListener('click', (e) => {
            if (e.target === contactOverlay) {
                closeContact();
            }
        });
    }
}

function openContact() {
    if (!contactOverlay) return;
    
    // Adiciona classe ativa
    contactOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Opcional: animação de flutuação central
    if (contactContent) {
        contactContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            contactContent.style.transform = 'scale(1)';
            contactContent.style.transition = 'transform 0.3s ease';
        }, 10);
    }
}

function closeContact() {
    if (!contactOverlay) return;
    
    contactOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Reset animação
    if (contactContent) {
        contactContent.style.transform = '';
        contactContent.style.transition = '';
    }
}

// Make globally accessible
window.openContact = openContact;
window.closeContact = closeContact;
