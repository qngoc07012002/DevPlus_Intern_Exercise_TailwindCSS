import { prices } from './config.js';

// Form data storage
let formData = {
    personalInfo: {
        name: '',
        email: '',
        phone: ''
    },
    plan: {
        name: 'arcade',
        price: 9,
        isYearly: false
    },
    addons: []
};

// Make functions available globally
function showStep(step) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update step circles
    document.querySelectorAll('.step-circle').forEach(circle => {
        circle.classList.remove('bg-[#BEE2FD]', 'text-[#022959]');
        if (parseInt(circle.dataset.step) === step) {
            circle.classList.add('bg-[#BEE2FD]', 'text-[#022959]');
        }
    });
}

function validateStep1() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    let isValid = true;

    // Name validation
    if (!name.value.trim()) {
        name.classList.add('error');
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    } else {
        name.classList.remove('error');
        document.getElementById('nameError').style.display = 'none';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
        email.classList.add('error');
        document.getElementById('emailError').style.display = 'block';
        document.getElementById('emailError').textContent = !email.value.trim() ? 'This field is required' : 'Invalid email format';
        isValid = false;
    } else {
        email.classList.remove('error');
        document.getElementById('emailError').style.display = 'none';
    }

    // Phone validation
    if (!phone.value.trim()) {
        phone.classList.add('error');
        document.getElementById('phoneError').style.display = 'block';
        isValid = false;
    } else {
        phone.classList.remove('error');
        document.getElementById('phoneError').style.display = 'none';
    }

    if (isValid) {
        formData.personalInfo = {
            name: name.value,
            email: email.value,
            phone: phone.value
        };
    }

    return isValid;
}

function nextStep(currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 5) {
        showStep(currentStep + 1);
        updateSummary();
    }
}

function prevStep(currentStep) {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function goToStep(step) {
    showStep(step);
}

function updatePrices() {
    const period = formData.plan.isYearly ? 'yearly' : 'monthly';
    const suffix = formData.plan.isYearly ? '/yr' : '/mo';

    // Update plan prices
    document.getElementById('arcade-price').textContent = `$${prices.plans.arcade[period]}${suffix}`;
    document.getElementById('advanced-price').textContent = `$${prices.plans.advanced[period]}${suffix}`;
    document.getElementById('pro-price').textContent = `$${prices.plans.pro[period]}${suffix}`;

    // Update add-on prices
    document.querySelectorAll('.addon-card').forEach(card => {
        const addonId = card.dataset.addon;
        const priceElement = card.querySelector('.text-[#483EFF]');
        priceElement.textContent = `+$${prices.addons[addonId][period]}${suffix}`;
    });

    // Show/hide yearly offers
    document.querySelectorAll('.yearly-offer').forEach(offer => {
        offer.classList.toggle('hidden', !formData.plan.isYearly);
    });

    // Update billing text colors
    document.getElementById('monthly-text').classList.toggle('text-[#9699AA]', formData.plan.isYearly);
    document.getElementById('yearly-text').classList.toggle('text-[#9699AA]', !formData.plan.isYearly);
}

function updateSummary() {
    const period = formData.plan.isYearly ? 'yearly' : 'monthly';
    const suffix = formData.plan.isYearly ? 'yr' : 'mo';

    // Update selected plan
    const planName = formData.plan.name.charAt(0).toUpperCase() + formData.plan.name.slice(1);
    document.getElementById('selected-plan').textContent = `${planName} (${period === 'yearly' ? 'Yearly' : 'Monthly'})`;
    document.getElementById('plan-price').textContent = `$${prices.plans[formData.plan.name][period]}/${suffix}`;

    // Update selected add-ons
    const addonsContainer = document.getElementById('selected-addons');
    addonsContainer.innerHTML = '';
    formData.addons.forEach(addon => {
        addonsContainer.innerHTML += `
            <div class="flex justify-between items-center">
                <p class="text-[#9699AA]">${addon.name}</p>
                <p class="text-[#022959]">+$${addon.price}/${suffix}</p>
            </div>
        `;
    });

    // Update total
    const planPrice = prices.plans[formData.plan.name][period];
    const addonsTotal = formData.addons.reduce((sum, addon) => sum + addon.price, 0);
    const total = planPrice + addonsTotal;
    document.getElementById('total-price').textContent = `+$${total}/${suffix}`;
}

// Make functions available globally
window.nextStep = nextStep;
window.prevStep = prevStep;
window.goToStep = goToStep;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Plan selection
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            formData.plan.name = card.dataset.plan;
            formData.plan.price = prices.plans[card.dataset.plan][formData.plan.isYearly ? 'yearly' : 'monthly'];
            updateSummary();
        });
    });

    // Billing toggle
    const billingToggle = document.getElementById('billing-toggle');
    billingToggle.addEventListener('change', () => {
        formData.plan.isYearly = billingToggle.checked;
        updatePrices();
        updateSummary();
    });

    // Add-ons selection
    const addonCards = document.querySelectorAll('.addon-card');
    addonCards.forEach(card => {
        card.addEventListener('click', () => {
            const checkbox = card.querySelector('.checkbox-custom');
            checkbox.classList.toggle('checked');
            card.classList.toggle('selected');
            
            const addonId = card.dataset.addon;
            if (checkbox.classList.contains('checked')) {
                formData.addons.push({
                    id: addonId,
                    name: prices.addons[addonId].name,
                    price: prices.addons[addonId][formData.plan.isYearly ? 'yearly' : 'monthly']
                });
            } else {
                formData.addons = formData.addons.filter(addon => addon.id !== addonId);
            }
            updateSummary();
        });
    });

    // Initialize the form
    showStep(1);
    planCards[0].classList.add('selected');
    updatePrices();
    updateSummary();
}); 