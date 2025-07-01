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
    // Leave Group Button
    leaveGroupBtn.addEventListener('click', function() {
        showModal(leaveGroupModal);
    });

    // Apply Check Button
    applyCheckBtn.addEventListener('click', function() {
        showModal(applyCheckModal);
        calculateSplit(); // Calculate initial split
    });

    // Placeholder Button (does nothing for now)
    placeholderBtn.addEventListener('click', function() {
        console.log('Placeholder button clicked - no action implemented yet');
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
    payerCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selected.push(checkbox.value);
        }
    });
    return selected;
}

function getSelectedPayersData() {
    const selected = [];
    payerCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const name = checkbox.nextElementSibling.textContent;
            selected.push({
                value: checkbox.value,
                name: name
            });
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
    payerCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    // Check the first checkbox by default
    if (payerCheckboxes.length > 0) {
        payerCheckboxes[0].checked = true;
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
    const rows = document.querySelectorAll('#payment-table tbody tr');
    
    rows.forEach(row => {
        const nameCell = row.querySelector('.name');
        if (nameCell && nameCell.textContent.trim() === personName) {
            const amountCell = row.querySelector('td:nth-child(2)');
            const statusCell = row.querySelector('td:nth-child(3) .status');
            
            if (amountCell && statusCell) {
                const currentAmount = amountCell.textContent;
                
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
                    showSuccessModal(`${methodName} payment successful!\n${personName} has paid ${currentAmount}`);
                    
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

// Utility function to update the table after splitting an expense
function updateTableAfterSplit(selectedPlayersData, amountPerPerson) {
    const rows = document.querySelectorAll('#payment-table tbody tr');
    
    selectedPlayersData.forEach(player => {
        rows.forEach(row => {
            const nameCell = row.querySelector('.name');
            if (nameCell && nameCell.textContent.trim() === player.name) {
                const amountCell = row.querySelector('td:nth-child(2)');
                if (amountCell) {
                    // Get current amount and add the new split amount
                    const currentAmountText = amountCell.textContent.replace('$', '');
                    const currentAmount = parseFloat(currentAmountText) || 0;
                    const newAmount = currentAmount + amountPerPerson;
                    
                    // Update the amount in the table
                    amountCell.textContent = `$${newAmount.toFixed(2)}`;
                    
                    // Update status to pending since they now owe money
                    const statusCell = row.querySelector('td:nth-child(3) .status');
                    if (statusCell && newAmount > 0) {
                        statusCell.textContent = 'Pending';
                        statusCell.className = 'status pending';
                    }
                }
            }
        });
    });
    
    // Add a small animation to highlight the updated rows
    selectedPlayersData.forEach(player => {
        rows.forEach(row => {
            const nameCell = row.querySelector('.name');
            if (nameCell && nameCell.textContent.trim() === player.name) {
                row.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    row.style.backgroundColor = '';
                }, 1500);
            }
        });
    });
}

// Utility function to add new person to the table (you can use this later)
function addPersonToTable(name, amount, status = 'pending') {
    const tableBody = document.querySelector('#payment-table tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td class="name">${name}</td>
        <td>$${parseFloat(amount).toFixed(2)}</td>
        <td><span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
    `;
    
    tableBody.appendChild(newRow);
}

// Utility function to update person's amount in table (you can use this later)
function updatePersonAmount(name, newAmount) {
    const rows = document.querySelectorAll('#payment-table tbody tr');
    rows.forEach(row => {
        const nameCell = row.querySelector('.name');
        if (nameCell && nameCell.textContent.trim() === name) {
            const amountCell = row.querySelector('td:nth-child(2)');
            if (amountCell) {
                amountCell.textContent = `$${parseFloat(newAmount).toFixed(2)}`;
            }
        }
    });
}

// Utility function to mark a person's payment as paid
function markAsPaid(name) {
    const rows = document.querySelectorAll('#payment-table tbody tr');
    rows.forEach(row => {
        const nameCell = row.querySelector('.name');
        if (nameCell && nameCell.textContent.trim() === name) {
            const amountCell = row.querySelector('td:nth-child(2)');
            const statusCell = row.querySelector('td:nth-child(3) .status');
            
            if (amountCell && statusCell) {
                amountCell.textContent = '$0.00';
                statusCell.textContent = 'Paid';
                statusCell.className = 'status paid';
                
                // Add animation
                row.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    row.style.backgroundColor = '';
                }, 1500);
            }
        }
    });
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