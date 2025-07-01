const getIdGroup = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Data Management - Dynamic Group Members List
let groupMembers = [
    {
        id: 1,
        name: 'John Doe',
        address: '0x1A2B3C4D5E6F7890123456789ABCDEF01234',
        amountOwed: 25.50,
        status: 'pending'
    },
    {
        id: 2,
        name: 'Jane Smith',
        address: '0x9876543210ABCDEF0123456789ABCDEF98765',
        amountOwed: 18.75,
        status: 'paid'
    },
    {
        id: 3,
        name: 'Mike Johnson',
        address: '0xABCDEF0123456789ABCDEF0123456789ABCD',
        amountOwed: 32.25,
        status: 'pending'
    },
    {
        id: 4,
        name: 'Sarah Wilson',
        address: '0x456789ABCDEF0123456789ABCDEF012345',
        amountOwed: 15.00,
        status: 'pending'
    }
];



// DOM Elements
const leaveGroupBtn = document.getElementById('leave-group-btn');
const applyCheckBtn = document.getElementById('apply-check-btn');
const placeholderBtn = document.getElementById('placeholder-btn');

// Modal Elements
const leaveGroupModal = document.getElementById('leave-group-modal');
const applyCheckModal = document.getElementById('apply-check-modal');

// Leave Group Modal Elements
const confirmLeaveBtn = document.getElementById('confirm-leave');
const cancelLeaveBtn = document.getElementById('cancel-leave');

// Apply Check Modal Elements
const confirmApplyBtn = document.getElementById('confirm-apply');
const cancelApplyBtn = document.getElementById('cancel-apply');
const expenseAmountInput = document.getElementById('expense-amount');
const splitAmountDisplay = document.getElementById('split-amount');
const payerCheckboxes = document.querySelectorAll('input[name="payer"]');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {

    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        window.location.href = './login.html';
        return;
    }

    // Initialize the table with dynamic data
    renderGroupTable();
    updatePayerCheckboxes();

    // Leave Group Button
    leaveGroupBtn.addEventListener('click', function() {
        showModal(leaveGroupModal);
    });

    // Apply Check Button
    applyCheckBtn.addEventListener('click', function() {
        showModal(applyCheckModal);
        calculateSplit(); // Calculate initial split
    });

    // Placeholder Button - now demonstrates dynamic functionality
    placeholderBtn.addEventListener('click', function() {
        // Cycle through different demo actions
        const demoActions = [addNewMemberDemo, removeRandomMemberDemo, updateRandomAmountDemo];
        const randomAction = demoActions[Math.floor(Math.random() * demoActions.length)];
        randomAction();
    });

    // Leave Group Modal - Confirm
    confirmLeaveBtn.addEventListener('click', function() {
        // Show confirmation message (you can implement actual leave logic later)
        showSuccessModal('You have left the group. This feature will be fully implemented later.');
        hideModal(leaveGroupModal);
    });

    // Leave Group Modal - Cancel
    cancelLeaveBtn.addEventListener('click', function() {
        hideModal(leaveGroupModal);
    });

    // Apply Check Modal - Confirm
    confirmApplyBtn.addEventListener('click', function() {
        const selectedPayers = getSelectedPayers();
        const selectedPayersData = getSelectedPayersData();
        const totalAmount = parseFloat(expenseAmountInput.value) || 0;
        
        if (selectedPayers.length === 0) {
            showErrorModal('Please select at least one person to split the expense.');
            return;
        }
        
        if (totalAmount <= 0) {
            showErrorModal('Please enter a valid amount.');
            return;
        }
        
        const amountPerPerson = parseFloat((totalAmount / selectedPayers.length).toFixed(2));
        
        // Update the table with new amounts
        updateTableAfterSplit(selectedPayersData, amountPerPerson);
        
        // Show confirmation message
        showSuccessModal(`Expense split successfully!\nTotal: $${totalAmount.toFixed(2)}\nPeople: ${selectedPayers.length}\nAmount per person: $${amountPerPerson.toFixed(2)}`);
        
        hideModal(applyCheckModal);
        resetCheckForm();
    });

    // Apply Check Modal - Cancel
    cancelApplyBtn.addEventListener('click', function() {
        hideModal(applyCheckModal);
        resetCheckForm();
    });

    // Expense amount input change
    expenseAmountInput.addEventListener('input', calculateSplit);

    // Checkbox change events
    payerCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateSplit);
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === leaveGroupModal) {
            hideModal(leaveGroupModal);
        }
        if (event.target === applyCheckModal) {
            hideModal(applyCheckModal);
            resetCheckForm();
        }
        // Close new modals when clicking outside
        const paymentConfirmationModal = document.getElementById('payment-confirmation-modal');
        const successModal = document.getElementById('success-modal');
        const errorModal = document.getElementById('error-modal');
        
        if (event.target === paymentConfirmationModal) {
            hideModal(paymentConfirmationModal);
        }
        if (event.target === successModal) {
            hideModal(successModal);
        }
        if (event.target === errorModal) {
            hideModal(errorModal);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (leaveGroupModal.style.display === 'block') {
                hideModal(leaveGroupModal);
            }
            if (applyCheckModal.style.display === 'block') {
                hideModal(applyCheckModal);
                resetCheckForm();
            }
            // Close new modals with Escape key
            const paymentConfirmationModal = document.getElementById('payment-confirmation-modal');
            const successModal = document.getElementById('success-modal');
            const errorModal = document.getElementById('error-modal');
            
            if (paymentConfirmationModal && paymentConfirmationModal.style.display === 'block') {
                hideModal(paymentConfirmationModal);
            }
            if (successModal && successModal.style.display === 'block') {
                hideModal(successModal);
            }
            if (errorModal && errorModal.style.display === 'block') {
                hideModal(errorModal);
            }
        }
    });
});

// Dynamic Table Management Functions
function renderGroupTable() {
    const tableBody = document.querySelector('#payment-table tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Generate rows from groupMembers data
    groupMembers.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="name-container">
                    <div class="name">${member.name}</div>
                    <div class="address">${member.address}</div>
                </div>
            </td>
            <td>$${member.amountOwed.toFixed(2)}</td>
            <td><span class="status ${member.status}">${member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span></td>
            <td><button class="payment-btn cash-btn" onclick="payWithCash('${member.name}')">Pay Cash</button></td>
            <td><button class="payment-btn blockchain-btn" onclick="payWithBlockchain('${member.name}')">Pay BlockChain</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function updatePayerCheckboxes() {
    const checkboxContainer = document.querySelector('.checkbox-group');
    
    // Clear existing checkboxes
    checkboxContainer.innerHTML = '';
    
    // Generate checkboxes from groupMembers data
    groupMembers.forEach((member, index) => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'payer';
        checkbox.value = member.id;
        if (index === 0) checkbox.checked = true; // Check first item by default
        
        const span = document.createElement('span');
        span.textContent = member.name;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        checkboxContainer.appendChild(label);
        
        // Add event listener for split calculation
        checkbox.addEventListener('change', calculateSplit);
    });
    
    // Update the payerCheckboxes NodeList reference
    window.payerCheckboxes = document.querySelectorAll('input[name="payer"]');
}

function addMember(name, address, amountOwed = 0, status = 'pending') {
    const newId = Math.max(...groupMembers.map(m => m.id), 0) + 1;
    const newMember = {
        id: newId,
        name: name,
        address: address,
        amountOwed: amountOwed,
        status: status
    };
    
    groupMembers.push(newMember);
    renderGroupTable();
    updatePayerCheckboxes();
    
    return newMember;
}

function removeMember(memberId) {
    groupMembers = groupMembers.filter(member => member.id !== memberId);
    renderGroupTable();
    updatePayerCheckboxes();
}

function updateMemberAmount(memberName, newAmount) {
    const member = groupMembers.find(m => m.name === memberName);
    if (member) {
        member.amountOwed = newAmount;
        member.status = newAmount > 0 ? 'pending' : 'paid';
        renderGroupTable();
    }
}

function getMemberByName(name) {
    return groupMembers.find(member => member.name === name);
}

function getMemberById(id) {
    return groupMembers.find(member => member.id === id);
}

// Helper Functions
function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function getSelectedPayers() {
    const selected = [];
    const currentCheckboxes = document.querySelectorAll('input[name="payer"]');
    currentCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(parseInt(checkbox.value));
        }
    });
    return selected;
}

function getSelectedPayersData() {
    const selected = [];
    const currentCheckboxes = document.querySelectorAll('input[name="payer"]');
    currentCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const memberId = parseInt(checkbox.value);
            const member = getMemberById(memberId);
            if (member) {
                selected.push({
                    id: member.id,
                    name: member.name,
                    address: member.address
                });
            }
        }
    });
    return selected;
}

function calculateSplit() {
    const totalAmount = parseFloat(expenseAmountInput.value) || 0;
    const selectedPayers = getSelectedPayers();
    const numberOfPayers = selectedPayers.length;
    
    if (numberOfPayers > 0 && totalAmount > 0) {
        const amountPerPerson = (totalAmount / numberOfPayers).toFixed(2);
        splitAmountDisplay.textContent = `Amount per person: $${amountPerPerson}`;
    } else {
        splitAmountDisplay.textContent = 'Amount per person: $0.00';
    }
}

function resetCheckForm() {
    expenseAmountInput.value = '';
    const currentCheckboxes = document.querySelectorAll('input[name="payer"]');
    currentCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    // Check the first checkbox by default
    if (currentCheckboxes.length > 0) {
        currentCheckboxes[0].checked = true;
    }
    calculateSplit();
}

// Payment Functions
function payWithCash(personName) {
    showPaymentConfirmationModal(personName, 'cash');
}

function payWithBlockchain(personName) {
    showPaymentConfirmationModal(personName, 'blockchain');
}

function processPayment(personName, paymentMethod) {
    // Update the data structure
    const member = getMemberByName(personName);
    if (member) {
        const currentAmount = member.amountOwed;
        member.amountOwed = 0;
        member.status = 'paid';
        
        // Update the UI
        const rows = document.querySelectorAll('#payment-table tbody tr');
        
        rows.forEach(row => {
            const nameCell = row.querySelector('.name');
            if (nameCell && nameCell.textContent.trim() === personName) {
                const amountCell = row.querySelector('td:nth-child(2)');
                const statusCell = row.querySelector('td:nth-child(3) .status');
                
                if (amountCell && statusCell) {
                    // Show processing animation
                    const paymentButtons = row.querySelectorAll('.payment-btn');
                    paymentButtons.forEach(btn => {
                        btn.disabled = true;
                        btn.textContent = 'Processing...';
                    });
                    
                    // Simulate payment processing
                    setTimeout(() => {
                        // Mark as paid
                        amountCell.textContent = '$0.00';
                        statusCell.textContent = 'Paid';
                        statusCell.className = 'status paid';
                        
                        // Add success animation
                        row.style.backgroundColor = '#d4edda';
                        
                        // Show success message
                        const methodName = paymentMethod === 'cash' ? 'Cash' : 'Blockchain';
                        showSuccessModal(`${methodName} payment successful!\n${personName} has paid $${currentAmount.toFixed(2)}`);
                        
                        // Reset buttons
                        paymentButtons.forEach(btn => {
                            btn.disabled = false;
                            if (btn.classList.contains('cash-btn')) {
                                btn.textContent = 'Pay Cash';
                            } else {
                                btn.textContent = 'Pay BlockChain';
                            }
                        });
                        
                        // Reset background color
                        setTimeout(() => {
                            row.style.backgroundColor = '';
                        }, 2000);
                        
                    }, 1500); // Simulate 1.5 second processing time
                }
            }
        });
    }
}

// Utility function to update the table after splitting an expense
function updateTableAfterSplit(selectedPlayersData, amountPerPerson) {
    selectedPlayersData.forEach(playerData => {
        const member = getMemberById(playerData.id);
        if (member) {
            // Update the data structure
            member.amountOwed += amountPerPerson;
            if (member.amountOwed > 0) {
                member.status = 'pending';
            }
        }
    });
    
    // Re-render the table with updated data
    renderGroupTable();
    
    // Add a small animation to highlight the updated rows
    setTimeout(() => {
        const rows = document.querySelectorAll('#payment-table tbody tr');
        selectedPlayersData.forEach(playerData => {
            rows.forEach(row => {
                const nameCell = row.querySelector('.name');
                if (nameCell && nameCell.textContent.trim() === playerData.name) {
                    row.style.backgroundColor = '#e8f5e8';
                    setTimeout(() => {
                        row.style.backgroundColor = '';
                    }, 1500);
                }
            });
        });
    }, 100);
}

// Legacy utility functions - now updated to work with dynamic data

// Utility function to add new person to the table (now integrated with data structure)
function addPersonToTable(name, address, amount, status = 'pending') {
    return addMember(name, address, amount, status);
}

// Utility function to update person's amount in table (now uses data structure)
function updatePersonAmount(name, newAmount) {
    return updateMemberAmount(name, newAmount);
}

// Utility function to mark a person's payment as paid (now uses data structure)
function markAsPaid(name) {
    const member = getMemberByName(name);
    if (member) {
        member.amountOwed = 0;
        member.status = 'paid';
        renderGroupTable();
        
        // Add animation to the updated row
        setTimeout(() => {
            const rows = document.querySelectorAll('#payment-table tbody tr');
            rows.forEach(row => {
                const nameCell = row.querySelector('.name');
                if (nameCell && nameCell.textContent.trim() === name) {
                    row.style.backgroundColor = '#d4edda';
                    setTimeout(() => {
                        row.style.backgroundColor = '';
                    }, 1500);
                }
            });
        }, 100);
    }
}

// Add click functionality to status cells to toggle payment status
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Add event listeners for new modal buttons
    const cancelPaymentBtn = document.querySelector('#payment-confirmation-modal .secondary-btn');
    const successOkBtn = document.querySelector('#success-modal .primary-btn');
    const errorOkBtn = document.querySelector('#error-modal .danger-btn');
    
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', function() {
            hideModal(document.getElementById('payment-confirmation-modal'));
        });
    }
    
    if (successOkBtn) {
        successOkBtn.addEventListener('click', function() {
            hideModal(document.getElementById('success-modal'));
        });
    }
    
    if (errorOkBtn) {
        errorOkBtn.addEventListener('click', function() {
            hideModal(document.getElementById('error-modal'));
        });
    }

    // Add click listeners to status cells after DOM is loaded
    // Removed status click listeners - status should not be clickable
});

// Modal Functions for Better UX
function showPaymentConfirmationModal(personName, paymentMethod) {
    const modal = document.getElementById('payment-confirmation-modal');
    const personNameSpan = document.getElementById('payment-person-name');
    const methodSpan = document.getElementById('payment-method');
    const confirmBtn = document.getElementById('confirm-payment');
    
    personNameSpan.textContent = personName;
    methodSpan.textContent = paymentMethod === 'cash' ? 'Cash' : 'Blockchain';
    
    // Remove existing event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', function() {
        processPayment(personName, paymentMethod);
        hideModal(modal);
    });
    
    showModal(modal);
}

function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const messageElement = document.getElementById('success-message');
    messageElement.textContent = message;
    showModal(modal);
}

function showErrorModal(message) {
    const modal = document.getElementById('error-modal');
    const messageElement = document.getElementById('error-message');
    messageElement.textContent = message;
    showModal(modal);
}

// Demo Functions - You can use these to test the dynamic functionality
function addNewMemberDemo() {
    const names = ['Alex Rodriguez', 'Emma Thompson', 'David Chen', 'Lisa Park'];
    const addresses = [
        '0xDEF123456789ABCDEF0123456789ABCDEF123',
        '0x789ABCDEF0123456789ABCDEF0123456789A',
        '0x234567890ABCDEF0123456789ABCDEF01234',
        '0xCDEF0123456789ABCDEF0123456789ABCDEF'
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    const randomAmount = Math.floor(Math.random() * 50) + 10; // Random amount between $10-$60
    
    // Check if member already exists
    if (!getMemberByName(randomName)) {
        const newMember = addMember(randomName, randomAddress, randomAmount);
        showSuccessModal(`Added new member: ${newMember.name} with $${newMember.amountOwed.toFixed(2)} debt`);
    } else {
        showErrorModal('Member already exists! Try again.');
    }
}

function removeRandomMemberDemo() {
    if (groupMembers.length > 1) {
        const randomIndex = Math.floor(Math.random() * groupMembers.length);
        const memberToRemove = groupMembers[randomIndex];
        removeMember(memberToRemove.id);
        showSuccessModal(`Removed member: ${memberToRemove.name}`);
    } else {
        showErrorModal('Cannot remove the last member!');
    }
}

function updateRandomAmountDemo() {
    if (groupMembers.length > 0) {
        const randomIndex = Math.floor(Math.random() * groupMembers.length);
        const member = groupMembers[randomIndex];
        const newAmount = Math.floor(Math.random() * 100) + 5; // Random amount between $5-$105
        
        updateMemberAmount(member.name, newAmount);
        showSuccessModal(`Updated ${member.name}'s amount to $${newAmount.toFixed(2)}`);
    }
}

// Global functions for console testing
window.groupMembers = groupMembers;
window.addMember = addMember;
window.removeMember = removeMember;
window.updateMemberAmount = updateMemberAmount;
window.getMemberByName = getMemberByName;
window.getMemberById = getMemberById;
window.addNewMemberDemo = addNewMemberDemo;
window.removeRandomMemberDemo = removeRandomMemberDemo;
window.updateRandomAmountDemo = updateRandomAmountDemo;

console.log('🎉 Dynamic Group Table Initialized!');
console.log('📝 Available functions:');
console.log('  - addMember(name, address, amount, status)');
console.log('  - removeMember(id)');
console.log('  - updateMemberAmount(name, newAmount)');
console.log('  - addNewMemberDemo()');
console.log('  - removeRandomMemberDemo()');
console.log('  - updateRandomAmountDemo()');
console.log('📊 Current group members:', groupMembers.length);