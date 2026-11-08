
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const authSection = document.getElementById("authSection");
const eventsSection = document.getElementById("eventsSection");
const eventDetailsSection = document.getElementById("eventDetailsSection");

const message = document.getElementById("message");
const eventsList = document.getElementById("eventsList");
const eventsMessage = document.getElementById("eventsMessage");

const logoutButton = document.getElementById("logoutButton");

const eventDetailsMessage =
    document.getElementById("eventDetailsMessage");
// משתתפי האירוע
const eventMembersSection =
    document.getElementById("eventMembersSection");

const eventMembersMessage =
    document.getElementById("eventMembersMessage");

const eventMembersList =
    document.getElementById("eventMembersList");
const backToEventsButton =
    document.getElementById("backToEventsButton");

const itemsSection = document.getElementById("itemsSection");
const itemsList = document.getElementById("itemsList");
const itemsMessage = document.getElementById("itemsMessage");

// ניהול תקציב והוצאות
const budgetSection = document.getElementById("budgetSection");
const plannedBudget = document.getElementById("plannedBudget");
const totalExpenses = document.getElementById("totalExpenses");
const totalContributions = document.getElementById("totalContributions");
const cashBalance = document.getElementById("cashBalance");
const activeMembersCount = document.getElementById("activeMembersCount");
const sharePerParticipant = document.getElementById("sharePerParticipant");

const expenseItemId = document.getElementById("expenseItemId");

const addExpenseForm = document.getElementById("addExpenseForm");
const expenseDescription = document.getElementById("expenseDescription");
const expenseAmount = document.getElementById("expenseAmount");
const expensesList = document.getElementById("expensesList");
const expensesMessage = document.getElementById("expensesMessage");

const addContributionForm =
    document.getElementById("addContributionForm");

const contributionAmount =
    document.getElementById("contributionAmount");

const contributionsList =
    document.getElementById("contributionsList");

const contributionsMessage =
    document.getElementById("contributionsMessage");

// ניהול פריטים
const showAddItemButton =
    document.getElementById("showAddItemButton");

const addItemFormContainer =
    document.getElementById("addItemFormContainer");

const addItemForm =
    document.getElementById("addItemForm");

const cancelAddItemButton =
    document.getElementById("cancelAddItemButton");

// יצירת אירוע
const createEventButton =
    document.getElementById("createEventButton");

const createEventFormContainer =
    document.getElementById("createEventFormContainer");

const createEventForm =
    document.getElementById("createEventForm");

const cancelCreateEvent =
    document.getElementById("cancelCreateEvent");

let currentPage = 1;
const pageSize = 6;

let currentEventId = null;


// ===============================
// הודעות
// ===============================

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#d93025" : "#23864b";
}


// ===============================
// התחברות והרשמה
// ===============================

function showLogin() {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    message.textContent = "";
}

function showRegister() {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    message.textContent = "";
}

loginTab.addEventListener("click", showLogin);
registerTab.addEventListener("click", showRegister);


// הרשמה
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName =
        document.getElementById("registerName").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;

    try {
        showMessage("יוצר חשבון...");

        await registerUser(fullName, email, password);

        registerForm.reset();
        showLogin();

        showMessage("ההרשמה הצליחה! אפשר להתחבר.");

    } catch (error) {
        showMessage(error.message, true);
    }
});


// התחברות
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;

    try {
        showMessage("מתחבר...");

        const result = await loginUser(email, password);

        const token = result.token || result.Token;
        const user = result.user || result.User;

        if (!token) {
            throw new Error("לא התקבל אסימון התחברות מהשרת.");
        }

        localStorage.setItem("gatherlyToken", token);
        localStorage.setItem("gatherlyUser", JSON.stringify(user));

        loginForm.reset();

        await showEventsScreen();

    } catch (error) {
        showMessage(error.message, true);
    }
});


// ===============================
// מסך האירועים
// ===============================

async function showEventsScreen() {
    authSection.classList.add("hidden");
    eventDetailsSection.classList.add("hidden");
    eventsSection.classList.remove("hidden");

    logoutButton.classList.remove("hidden");

    const user = JSON.parse(
        localStorage.getItem("gatherlyUser") || "{}"
    );

    document.getElementById("welcomeMessage").textContent =
        `שלום ${user.fullName || user.FullName || ""}, איזה כיף שחזרת!`;

    currentPage = 1;

    await loadEvents();
}


// טעינת אירועים
async function loadEvents() {
    eventsList.innerHTML = "";
    eventsMessage.textContent = "טוען אירועים...";

    try {
        const result = await getMyEvents(currentPage, pageSize);

        const events = result.items || result.Items || [];

        const totalPages =
            result.totalPages ??
            result.TotalPages ??
            Math.ceil(
                (result.totalCount ?? result.TotalCount ?? 0) / pageSize
            );

        eventsMessage.textContent = "";

        if (events.length === 0) {
            eventsMessage.textContent =
                "עדיין אין לך אירועים. אפשר ליצור אירוע חדש!";
        }

        events.forEach(event => {
            const card = document.createElement("article");
            card.className = "event-card";
            card.style.cursor = "pointer";
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            const openDetails = () => {
                const id = event.id ?? event.Id;
                showEventDetails(id);
            };

            card.addEventListener("click", openDetails);

            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openDetails();
                }
            });

            const title = document.createElement("h2");
            title.textContent =
                event.name || event.Name || "אירוע ללא שם";

            const date = document.createElement("p");
            const eventDate = event.date || event.Date;

            date.textContent = eventDate
                ? new Date(eventDate).toLocaleDateString("he-IL")
                : "תאריך לא צוין";

            const eventId = document.createElement("span");
            eventId.textContent =
                `מספר אירוע: ${event.id ?? event.Id}`;

            card.append(title, date, eventId);
            eventsList.appendChild(card);
        });

        document.getElementById("pageInfo").textContent =
            `עמוד ${currentPage} מתוך ${totalPages}`;

        document.getElementById("previousPage").disabled =
            currentPage <= 1;

        document.getElementById("nextPage").disabled =
            currentPage >= totalPages;

    } catch (error) {
        eventsMessage.textContent = error.message;

        if (error.message.includes("401")) {
            logout();
        }
    }
}


// מעבר בין עמודים
document.getElementById("previousPage").addEventListener("click", async () => {
    if (currentPage > 1) {
        currentPage--;
        await loadEvents();
    }
});

document.getElementById("nextPage").addEventListener("click", async () => {
    currentPage++;
    await loadEvents();
});


// ===============================
// יצירת אירוע
// ===============================

createEventButton.addEventListener("click", () => {
    createEventFormContainer.classList.remove("hidden");
    createEventButton.classList.add("hidden");
});

cancelCreateEvent.addEventListener("click", () => {
    createEventFormContainer.classList.add("hidden");
    createEventButton.classList.remove("hidden");
    createEventForm.reset();
});

createEventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const eventData = {
        name: document.getElementById("eventName").value.trim(),

        description:
            document.getElementById("eventDescription").value.trim() || null,

        date: new Date(
            document.getElementById("eventDate").value
        ).toISOString(),

        location:
            document.getElementById("eventLocation").value.trim() || null,

        budget:
            document.getElementById("eventBudget").value === ""
                ? null
                : Number(document.getElementById("eventBudget").value),

        managementType: Number(
            document.getElementById("managementType").value
        )
    };

    const submitButton =
        createEventForm.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        submitButton.textContent = "יוצר אירוע...";

        await createEvent(eventData);

        createEventForm.reset();
        createEventFormContainer.classList.add("hidden");
        createEventButton.classList.remove("hidden");

        await loadEvents();

        eventsMessage.textContent = "האירוע נוצר בהצלחה!";

    } catch (error) {
        eventsMessage.textContent = error.message;

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "יצירת אירוע";
    }
});


// ===============================
// פרטי אירוע
// ===============================
const organizerActions =
    document.getElementById("organizerActions");

const invitationSection =
    document.getElementById("invitationSection");

const createInvitationButton =
    document.getElementById("createInvitationButton");

const invitationExpiration =
    document.getElementById("invitationExpiration");

const invitationResult =
    document.getElementById("invitationResult");

const editEventButton =
    document.getElementById("editEventButton");

const deleteEventButton =
    document.getElementById("deleteEventButton");

const editEventFormContainer =
    document.getElementById("editEventFormContainer");

const editEventForm =
    document.getElementById("editEventForm");

const cancelEditEvent =
    document.getElementById("cancelEditEvent");
async function showEventDetails(eventId) {
    currentEventId = eventId;

    eventsSection.classList.add("hidden");
    eventDetailsSection.classList.remove("hidden");

    eventDetailsMessage.textContent = "טוען פרטי אירוע...";

    itemsSection.classList.add("hidden");
    itemsList.innerHTML = "";
    itemsMessage.textContent = "";

    budgetSection.classList.add("hidden");
    expensesList.innerHTML = "";
    contributionsList.innerHTML = "";
    expensesMessage.textContent = "";
    contributionsMessage.textContent = "";

    addItemFormContainer.classList.add("hidden");
    showAddItemButton.classList.remove("hidden");

    try {
        const event = await getEventById(eventId);
        if (eventMembersSection) {
            eventMembersSection.classList.remove("hidden");
        }

        await loadEventMembers(eventId);
        console.log("עומדת לטעון משתתפים לאירוע:", eventId);
        // זיהוי תפקיד המשתמש באירוע
        const currentUserId = getCurrentUserId();

        const organizerId = Number(
            event.organizerId ?? event.OrganizerId
        );

        const isOrganizer = currentUserId === organizerId;

        organizerActions.classList.toggle("hidden", !isOrganizer);

        if (invitationSection) {
            invitationSection.classList.toggle("hidden", !isOrganizer);
        }

        if (invitationResult) {
            invitationResult.innerHTML = "";
        }

        const roleElement = document.getElementById("currentEventRole");

        if (roleElement) {
            roleElement.textContent = isOrganizer
                ? "👑 את המארגנת של האירוע"
                : "👤 את משתתפת באירוע";
        }

        document.getElementById("detailsEventName").textContent =
            event.name || event.Name || "";

        document.getElementById("detailsEventDescription").textContent =
            event.description || event.Description || "אין תיאור לאירוע";

        const date = event.date || event.Date;

        document.getElementById("detailsEventDate").textContent =
            date
                ? new Date(date).toLocaleString("he-IL")
                : "לא צוין";

        document.getElementById("detailsEventLocation").textContent =
            event.location || event.Location || "לא צוין";

        const budget = event.budget ?? event.Budget;

        document.getElementById("detailsEventBudget").textContent =
            budget == null ? "לא הוגדר" : `${budget} ₪`;

        const managementType = Number(
            event.managementType ?? event.ManagementType
        );

        const managementNames = {
            0: "ניהול פריטים בלבד",
            1: "ניהול תקציב והוצאות בלבד",
            2: "ניהול פריטים ותקציב"
        };

        document.getElementById("detailsManagementType").textContent =
            managementNames[managementType] || "לא צוין";

        const eventInfoBudget =
            document.getElementById("eventInfoBudget");

        const eventInfoManagement =
            document.getElementById("eventInfoManagement");

        if (eventInfoBudget) {
            eventInfoBudget.textContent =
                budget == null ? "לא הוגדר" : formatMoney(budget);
        }

        if (eventInfoManagement) {
            eventInfoManagement.textContent =
                managementNames[managementType] || "לא צוין";
        }

        document.getElementById("detailsEventId").textContent =
            event.id ?? event.Id;

        configureEventTabs(managementType);

        eventDetailsMessage.textContent = "";

        if (managementType === 1 || managementType === 2) {
            budgetSection.classList.remove("hidden");
            await loadBudget(eventId, event);
        }

        if (managementType === 0 || managementType === 2) {
            itemsSection.classList.remove("hidden");
            await loadItems(eventId);
        }

    } catch (error) {
        eventDetailsMessage.textContent =
            `לא ניתן לטעון את פרטי האירוע: ${error.message}`;
    }
}


// חזרה לרשימת האירועים
backToEventsButton.addEventListener("click", () => {
    eventDetailsSection.classList.add("hidden");
    eventsSection.classList.remove("hidden");

    currentEventId = null;
});

// ===============================
// ניהול פריטים
// ===============================

// טעינת פריטים מהשרת
async function loadItems(eventId) {
    itemsList.innerHTML = "";
    itemsMessage.textContent = "טוען פריטים...";

    try {
        const items = await getItemsByEvent(eventId);

        if (!items || items.length === 0) {
            itemsMessage.textContent =
                "עדיין אין פריטים באירוע. אפשר להוסיף את הפריט הראשון!";
            return;
        }

        const storedUser = JSON.parse(
            localStorage.getItem("gatherlyUser") || "{}"
        );

        const currentUserId = Number(storedUser.id ?? storedUser.Id);

        itemsMessage.textContent = "";

        for (const item of items) {
            const itemId = item.id ?? item.Id;
            const card = document.createElement("article");
            card.className = "item-card";

            const name = document.createElement("h3");
            name.textContent = item.name ?? item.Name ?? "";

            const description = document.createElement("p");
            description.textContent =
                item.description ?? item.Description ?? "";

            const quantity = Number(item.quantity ?? item.Quantity ?? 0);

            const claimedQuantity = Number(
                item.claimedQuantity ?? item.ClaimedQuantity ?? 0
            );

            const remainingQuantity = Number(
                item.remainingQuantity ?? item.RemainingQuantity ?? 0
            );

            const quantityInfo = document.createElement("p");
            quantityInfo.textContent = `כמות נדרשת: ${quantity}`;

            const claimedInfo = document.createElement("p");
            claimedInfo.textContent = `כמות שנתפסה: ${claimedQuantity}`;

            const remainingInfo = document.createElement("p");
            remainingInfo.textContent = `כמות שנותרה: ${remainingQuantity}`;

            const estimatedCost =
                item.estimatedCost ?? item.EstimatedCost;

            const costInfo = document.createElement("p");
            costInfo.textContent =
                estimatedCost == null
                    ? "עלות משוערת: לא צוינה"
                    : `עלות משוערת: ${estimatedCost} ₪`;

            // הצגת התפיסות
            const claimsSection = document.createElement("div");
            claimsSection.className = "item-claims";

            const claimsTitle = document.createElement("h4");
            claimsTitle.textContent = "מי לוקח את הפריט?";
            claimsSection.appendChild(claimsTitle);

            let claims = [];

            try {
                claims = await getItemClaims(itemId);
            } catch (error) {
                const errorText = document.createElement("p");
                errorText.textContent =
                    `לא ניתן לטעון את התפיסות: ${error.message}`;
                claimsSection.appendChild(errorText);
            }

            const activeClaims = (claims || []).filter(
                claim => claim.isActive ?? claim.IsActive
            );

            if (activeClaims.length === 0) {
                const noClaims = document.createElement("p");
                noClaims.textContent = "עדיין אף אחד לא תפס את הפריט.";
                claimsSection.appendChild(noClaims);
            }

            const myClaims = activeClaims.filter(
                claim =>
                    Number(claim.userId ?? claim.UserId) === currentUserId
            );

            activeClaims.forEach(claim => {
                const claimInfo = document.createElement("p");

                const userName =
                    claim.userName ?? claim.UserName ?? "משתתף";

                const claimQuantity =
                    claim.quantity ?? claim.Quantity;

                claimInfo.textContent =
                    `${userName} — ${claimQuantity} יחידות`;

                claimsSection.appendChild(claimInfo);
            });

            // עדכון או ביטול תפיסה קיימת
            myClaims.forEach(claim => {
                const claimId = claim.id ?? claim.Id;

                const currentClaimQuantity =
                    Number(claim.quantity ?? claim.Quantity);

                const controls = document.createElement("div");
                controls.className = "claim-controls";

                const input = document.createElement("input");
                input.type = "number";
                input.min = "1";
                input.value = String(currentClaimQuantity);
                input.placeholder = "כמות חדשה";

                const updateButton = document.createElement("button");
                updateButton.type = "button";
                updateButton.textContent = "עדכון הכמות";

                updateButton.addEventListener("click", async () => {
                    const newQuantity = Number(input.value);

                    const otherClaimsQuantity = activeClaims
                        .filter(c =>
                            Number(c.id ?? c.Id) !== Number(claimId)
                        )
                        .reduce(
                            (sum, c) =>
                                sum + Number(c.quantity ?? c.Quantity),
                            0
                        );

                    const maxAllowed = quantity - otherClaimsQuantity;

                    if (
                        !Number.isInteger(newQuantity) ||
                        newQuantity < 1 ||
                        newQuantity > maxAllowed
                    ) {
                        itemsMessage.textContent =
                            `יש לבחור כמות בין 1 ל-${maxAllowed}.`;
                        return;
                    }

                    try {
                        updateButton.disabled = true;
                        updateButton.textContent = "מעדכן...";

                        await updateItemClaim(
                            claimId,
                            itemId,
                            newQuantity
                        );

                        await loadItems(eventId);

                        itemsMessage.textContent =
                            "כמות התפיסה עודכנה בהצלחה!";

                    } catch (error) {
                        itemsMessage.textContent =
                            `שגיאה בעדכון התפיסה: ${error.message}`;

                    } finally {
                        updateButton.disabled = false;
                        updateButton.textContent = "עדכון הכמות";
                    }
                });

                const cancelButton = document.createElement("button");
                cancelButton.type = "button";
                cancelButton.textContent = "ביטול התפיסה";

                cancelButton.addEventListener("click", async () => {
                    if (!confirm("לבטל את התפיסה של הפריט?")) {
                        return;
                    }

                    try {
                        cancelButton.disabled = true;
                        cancelButton.textContent = "מבטל...";

                        await cancelItemClaim(claimId);

                        await loadItems(eventId);

                        itemsMessage.textContent =
                            "התפיסה בוטלה בהצלחה!";

                    } catch (error) {
                        itemsMessage.textContent =
                            `שגיאה בביטול התפיסה: ${error.message}`;

                    } finally {
                        cancelButton.disabled = false;
                        cancelButton.textContent = "ביטול התפיסה";
                    }
                });

                controls.append(input, updateButton, cancelButton);
                claimsSection.appendChild(controls);
            });

            // תפיסה חדשה — רק אם למשתמש אין כבר תפיסה
            if (myClaims.length === 0 && remainingQuantity > 0) {
                const claimControls = document.createElement("div");
                claimControls.className = "claim-controls";

                const input = document.createElement("input");
                input.type = "number";
                input.min = "1";
                input.max = String(remainingQuantity);
                input.value = "1";
                input.placeholder = "כמות לתפיסה";

                const claimButton = document.createElement("button");
                claimButton.type = "button";
                claimButton.className = "primary-button";
                claimButton.textContent = "אני לוקח/ת";

                claimButton.addEventListener("click", async () => {
                    const quantityToClaim = Number(input.value);

                    if (
                        !Number.isInteger(quantityToClaim) ||
                        quantityToClaim < 1 ||
                        quantityToClaim > remainingQuantity
                    ) {
                        itemsMessage.textContent =
                            "יש לבחור כמות תקינה מתוך הכמות שנותרה.";
                        return;
                    }

                    try {
                        claimButton.disabled = true;
                        claimButton.textContent = "שומר...";

                        await createItemClaim(itemId, quantityToClaim);

                        await loadItems(eventId);

                        itemsMessage.textContent =
                            "הפריט נתפס בהצלחה!";

                    } catch (error) {
                        itemsMessage.textContent =
                            `לא ניתן לתפוס את הפריט: ${error.message}`;

                        await loadItems(eventId);

                    } finally {
                        claimButton.disabled = false;
                        claimButton.textContent = "אני לוקח/ת";
                    }
                });

                claimControls.append(input, claimButton);
                claimsSection.appendChild(claimControls);
            }

            card.append(
                name,
                description,
                quantityInfo,
                claimedInfo,
                remainingInfo,
                costInfo,
                claimsSection
            );

            itemsList.appendChild(card);
        }

    } catch (error) {
        itemsMessage.textContent =
            `שגיאה בטעינת פריטים: ${error.message}`;
    }
}


// פתיחת טופס הוספת פריט
showAddItemButton.addEventListener("click", () => {
    addItemFormContainer.classList.remove("hidden");
    showAddItemButton.classList.add("hidden");
});


// ביטול הוספת פריט
cancelAddItemButton.addEventListener("click", () => {
    addItemForm.reset();

    addItemFormContainer.classList.add("hidden");
    showAddItemButton.classList.remove("hidden");
});


// שמירת פריט חדש
addItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentEventId == null) {
        itemsMessage.textContent = "לא נבחר אירוע.";
        return;
    }

    const itemData = {
        eventId: currentEventId,

        name:
            document.getElementById("itemName").value.trim(),

        description:
            document.getElementById("itemDescription").value.trim() || null,

        quantity: Number(
            document.getElementById("itemQuantity").value
        ),

        estimatedCost:
            document.getElementById("itemEstimatedCost").value === ""
                ? null
                : Number(
                    document.getElementById("itemEstimatedCost").value
                )
    };

    const submitButton =
        addItemForm.querySelector('button[type="submit"]');

    try {
        submitButton.disabled = true;
        submitButton.textContent = "שומר פריט...";

        await createItem(itemData);

        addItemForm.reset();

        addItemFormContainer.classList.add("hidden");
        showAddItemButton.classList.remove("hidden");

        await loadItems(currentEventId);

        itemsMessage.textContent = "הפריט נוסף בהצלחה!";

    } catch (error) {
        itemsMessage.textContent =
            `שגיאה בהוספת הפריט: ${error.message}`;

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "שמירת פריט";
    }
});

// =====================================
// ניהול תקציב, הוצאות והפקדות
// =====================================

function getCurrentUserId() {
    const user = JSON.parse(
        localStorage.getItem("gatherlyUser") || "{}"
    );

    return Number(user.id ?? user.Id);
}


function formatMoney(amount) {
    return `${Number(amount || 0).toFixed(2)} ₪`;
}


// =====================================
// טעינת נתוני התקציב
// =====================================

async function loadBudget(eventId, event) {
    expensesList.innerHTML = "";
    contributionsList.innerHTML = "";

    expensesMessage.textContent = "טוען הוצאות...";
    contributionsMessage.textContent = "טוען הפקדות...";

    try {
        const [expenses, share, contributions] = await Promise.all([
            getExpensesByEvent(eventId),
            getExpenseShare(eventId),
            getContributionsByEvent(eventId)
        ]);

        // תקציב מתוכנן
        const budget = event.budget ?? event.Budget;

        plannedBudget.textContent =
            budget == null ? "לא הוגדר" : formatMoney(budget);

        // חישוב סך ההפקדות
        const contributionsTotal = (contributions || []).reduce(
            (sum, contribution) =>
                sum + Number(
                    contribution.amount ?? contribution.Amount ?? 0
                ),
            0
        );

        // חישוב סך ההוצאות
        const expensesTotal = (expenses || []).reduce(
            (sum, expense) =>
                sum + Number(expense.amount ?? expense.Amount ?? 0),
            0
        );

        totalContributions.textContent =
            formatMoney(contributionsTotal);

        totalExpenses.textContent =
            formatMoney(
                share.totalExpenses ??
                share.TotalExpenses ??
                expensesTotal
            );

        // יתרת הקופה = הפקדות פחות הוצאות
        cashBalance.textContent =
            formatMoney(contributionsTotal - expensesTotal);

        // מספר משתתפים פעילים
        activeMembersCount.textContent =
            share.activeMembersCount ??
            share.ActiveMembersCount ??
            0;

        // חלק שווה בהוצאות לכל משתתף
        const participantShare =
            share.sharePerParticipant ??
            share.SharePerParticipant;

        sharePerParticipant.textContent =
            participantShare == null
                ? "לא ניתן לחשב"
                : formatMoney(participantShare);

        // הצגת הרשימות
        renderExpenses(expenses || []);
        renderContributions(contributions || []);

        // טעינת פריטים לבחירה בטופס ההוצאה
        await loadExpenseItems(eventId);

        expensesMessage.textContent =
            (expenses || []).length === 0
                ? "עדיין לא נרשמו הוצאות."
                : "";

        contributionsMessage.textContent =
            (contributions || []).length === 0
                ? "עדיין לא נרשמו הפקדות."
                : "";

    } catch (error) {
        expensesMessage.textContent =
            `שגיאה בטעינת נתוני התקציב: ${error.message}`;

        contributionsMessage.textContent =
            `לא ניתן לטעון את הנתונים: ${error.message}`;
    }
}


// =====================================
// טעינת פריטים לטופס ההוצאות
// =====================================

async function loadExpenseItems(eventId) {
    if (!expenseItemId) return;

    expenseItemId.innerHTML =
        '<option value="">הוצאה כללית (ללא פריט)</option>';

    try {
        const items = await getItemsByEvent(eventId);

        (items || []).forEach(item => {
            const option = document.createElement("option");

            option.value = item.id ?? item.Id;
            option.textContent =
                item.name ?? item.Name ?? "פריט";

            expenseItemId.appendChild(option);
        });

    } catch (error) {
        console.error(
            "לא ניתן לטעון פריטים לטופס ההוצאות:",
            error
        );
    }
}


// =====================================
// הצגת ההוצאות
// =====================================

function renderExpenses(expenses) {
    expensesList.innerHTML = "";

    const currentUserId = getCurrentUserId();

    expenses.forEach(expense => {
        const id = expense.id ?? expense.Id;

        const paidByUserId =
            Number(expense.paidByUserId ?? expense.PaidByUserId);

        const card = document.createElement("div");
        card.className = "item-card";

        const description = document.createElement("h4");
        description.textContent =
            expense.description ?? expense.Description ?? "הוצאה";

        const amount = document.createElement("p");
        amount.textContent =
            `סכום: ${formatMoney(expense.amount ?? expense.Amount)}`;

        const payer = document.createElement("p");
        payer.textContent =
            `שולם על ידי: ${expense.paidByUserName ??
            expense.PaidByUserName ??
            "משתתף"
            }`;

        const date = document.createElement("p");
        const createdAt = expense.createdAt ?? expense.CreatedAt;

        date.textContent = createdAt
            ? `תאריך: ${new Date(createdAt).toLocaleDateString("he-IL")}`
            : "";

        card.append(description, amount, payer, date);

        // רק מי שיצר את ההוצאה יכול למחוק אותה
        if (paidByUserId === currentUserId) {
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "secondary-button";
            deleteButton.textContent = "מחיקת הוצאה";

            deleteButton.addEventListener("click", async () => {
                if (!confirm("למחוק את ההוצאה?")) return;

                try {
                    deleteButton.disabled = true;

                    await deleteExpense(id);
                    await refreshBudget();

                    expensesMessage.textContent =
                        "ההוצאה נמחקה בהצלחה!";

                } catch (error) {
                    expensesMessage.textContent =
                        `שגיאה במחיקת ההוצאה: ${error.message}`;

                    deleteButton.disabled = false;
                }
            });

            card.appendChild(deleteButton);
        }

        expensesList.appendChild(card);
    });
}


// =====================================
// הצגת ההפקדות
// =====================================

function renderContributions(contributions) {
    contributionsList.innerHTML = "";

    const currentUserId = getCurrentUserId();

    contributions.forEach(contribution => {
        const id = contribution.id ?? contribution.Id;

        const userId =
            Number(contribution.userId ?? contribution.UserId);

        const card = document.createElement("div");
        card.className = "item-card";

        const name = document.createElement("h4");
        name.textContent =
            contribution.userName ??
            contribution.UserName ??
            "משתתף";

        const amount = document.createElement("p");
        amount.textContent =
            `הפקדה: ${formatMoney(
                contribution.amount ?? contribution.Amount
            )}`;

        card.append(name, amount);

        // כל משתמש יכול לערוך ולמחוק רק את ההפקדות שלו
        if (userId === currentUserId) {
            const input = document.createElement("input");

            input.type = "number";
            input.min = "0.01";
            input.step = "0.01";

            input.value = String(
                contribution.amount ?? contribution.Amount
            );

            const updateButton = document.createElement("button");

            updateButton.type = "button";
            updateButton.className = "secondary-button";
            updateButton.textContent = "עדכון הפקדה";

            updateButton.addEventListener("click", async () => {
                const newAmount = Number(input.value);

                if (!Number.isFinite(newAmount) || newAmount <= 0) {
                    contributionsMessage.textContent =
                        "יש להזין סכום חיובי.";
                    return;
                }

                try {
                    updateButton.disabled = true;

                    await updateContribution(
                        id,
                        currentEventId,
                        newAmount
                    );

                    await refreshBudget();

                    contributionsMessage.textContent =
                        "ההפקדה עודכנה בהצלחה!";

                } catch (error) {
                    contributionsMessage.textContent =
                        `שגיאה בעדכון ההפקדה: ${error.message}`;

                } finally {
                    updateButton.disabled = false;
                }
            });

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "secondary-button";
            deleteButton.textContent = "מחיקת הפקדה";

            deleteButton.addEventListener("click", async () => {
                if (!confirm("למחוק את ההפקדה?")) return;

                try {
                    deleteButton.disabled = true;

                    await deleteContribution(id);
                    await refreshBudget();

                    contributionsMessage.textContent =
                        "ההפקדה נמחקה בהצלחה!";

                } catch (error) {
                    contributionsMessage.textContent =
                        `שגיאה במחיקת ההפקדה: ${error.message}`;

                    deleteButton.disabled = false;
                }
            });

            card.append(input, updateButton, deleteButton);
        }

        contributionsList.appendChild(card);
    });
}


// =====================================
// רענון נתוני התקציב
// =====================================

async function refreshBudget() {
    if (currentEventId == null) return;

    const event = await getEventById(currentEventId);

    await loadBudget(currentEventId, event);
}


// =====================================
// בחירת פריט ומילוי תיאור ההוצאה
// =====================================

if (expenseItemId) {
    expenseItemId.addEventListener("change", () => {
        const selectedOption =
            expenseItemId.options[expenseItemId.selectedIndex];

        if (expenseItemId.value) {
            expenseDescription.value = selectedOption.textContent;
        } else {
            expenseDescription.value = "";
        }
    });
}


// =====================================
// הוספת הוצאה
// =====================================

addExpenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentEventId == null) return;

    const amount = Number(expenseAmount.value);
    const description = expenseDescription.value.trim();

    const itemId = expenseItemId && expenseItemId.value
        ? Number(expenseItemId.value)
        : null;

    if (!Number.isFinite(amount) || amount <= 0) {
        expensesMessage.textContent = "יש להזין סכום חיובי.";
        return;
    }

    if (!description) {
        expensesMessage.textContent = "יש להזין תיאור להוצאה.";
        return;
    }

    const button = addExpenseForm.querySelector(
        'button[type="submit"]'
    );

    try {
        button.disabled = true;
        button.textContent = "שומר...";

        await createExpense(
            currentEventId,
            amount,
            description,
            itemId
        );

        addExpenseForm.reset();

        await refreshBudget();

        expensesMessage.textContent =
            "ההוצאה נוספה בהצלחה!";

    } catch (error) {
        expensesMessage.textContent =
            `שגיאה בהוספת ההוצאה: ${error.message}`;

    } finally {
        button.disabled = false;
        button.textContent = "שמירת הוצאה";
    }
});


// =====================================
// הוספת הפקדה לקופה
// =====================================

addContributionForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentEventId == null) return;

    const amount = Number(contributionAmount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        contributionsMessage.textContent =
            "יש להזין סכום הפקדה חיובי.";
        return;
    }

    const button = addContributionForm.querySelector(
        'button[type="submit"]'
    );

    try {
        button.disabled = true;
        button.textContent = "שומר...";

        await createContribution(currentEventId, amount);

        addContributionForm.reset();

        await refreshBudget();

        contributionsMessage.textContent =
            "ההפקדה נוספה בהצלחה!";

    } catch (error) {
        contributionsMessage.textContent =
            `שגיאה בהוספת ההפקדה: ${error.message}`;

    } finally {
        button.disabled = false;
        button.textContent = "הפקדת כסף לקופה";
    }
});


// =====================================
// ניווט בין לשוניות האירוע
// =====================================

const eventTabs = document.querySelectorAll(".event-tab");

eventTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        if (tab.classList.contains("hidden")) return;

        const targetId = tab.dataset.tab;

        // הסרת סימון מכל הלשוניות
        eventTabs.forEach(item => {
            item.classList.remove("active");
        });

        // הסתרת כל האזורים
        document.querySelectorAll(".event-tab-panel").forEach(panel => {
            panel.classList.add("hidden");
        });

        // סימון הלשונית שנבחרה
        tab.classList.add("active");

        // הצגת האזור המתאים
        const targetPanel = document.getElementById(targetId);

        if (targetPanel) {
            targetPanel.classList.remove("hidden");
        }
    });
});


// הצגת הלשוניות בהתאם לסוג הניהול של האירוע
function configureEventTabs(managementType) {
    const itemsTab = document.querySelector(
        '[data-tab="itemsPanel"]'
    );

    const budgetTab = document.querySelector(
        '[data-tab="budgetPanel"]'
    );

    const infoTab = document.querySelector(
        '[data-tab="eventInfoPanel"]'
    );

    if (!itemsTab || !budgetTab || !infoTab) return;

    // אירוע תקציבי בלבד לא מציג לשונית פריטים
    itemsTab.classList.toggle(
        "hidden",
        managementType === 1
    );

    // אירוע פריטים בלבד לא מציג לשונית תקציב
    budgetTab.classList.toggle(
        "hidden",
        managementType === 0
    );

    // בכל כניסה לאירוע מתחילים בפרטי האירוע
    eventTabs.forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".event-tab-panel").forEach(panel => {
        panel.classList.add("hidden");
    });

    infoTab.classList.add("active");

    const infoPanel =
        document.getElementById("eventInfoPanel");

    if (infoPanel) {
        infoPanel.classList.remove("hidden");
    }
}


// =====================================
// התנתקות
// =====================================

function logout() {
    localStorage.removeItem("gatherlyToken");
    localStorage.removeItem("gatherlyUser");

    eventsSection.classList.add("hidden");
    eventDetailsSection.classList.add("hidden");
    authSection.classList.remove("hidden");

    logoutButton.classList.add("hidden");

    currentEventId = null;

    showLogin();
}

logoutButton.addEventListener("click", logout);


// =====================================
// שחזור התחברות לאחר רענון
// =====================================

if (localStorage.getItem("gatherlyToken")) {
    showEventsScreen();
} else {
    showLogin();
}
editEventButton.addEventListener("click", async () => {
    try {
        const event = await getEventById(currentEventId);

        document.getElementById("editEventName").value =
            event.name ?? event.Name ?? "";

        document.getElementById("editEventDescription").value =
            event.description ?? event.Description ?? "";

        const date = event.date ?? event.Date;

        if (date) {
            const localDate = new Date(date);
            const offset = localDate.getTimezoneOffset() * 60000;

            document.getElementById("editEventDate").value =
                new Date(localDate.getTime() - offset)
                    .toISOString()
                    .slice(0, 16);
        }

        document.getElementById("editEventLocation").value =
            event.location ?? event.Location ?? "";

        document.getElementById("editEventBudget").value =
            event.budget ?? event.Budget ?? "";

        editEventFormContainer.classList.remove("hidden");

    } catch (error) {
        eventDetailsMessage.textContent = error.message;
    }
});

cancelEditEvent.addEventListener("click", () => {
    editEventFormContainer.classList.add("hidden");
    editEventForm.reset();
});

editEventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const eventData = {
        name: document.getElementById("editEventName").value.trim(),

        description:
            document.getElementById("editEventDescription").value.trim() || null,

        date: new Date(
            document.getElementById("editEventDate").value
        ).toISOString(),

        location:
            document.getElementById("editEventLocation").value.trim() || null,

        budget:
            document.getElementById("editEventBudget").value === ""
                ? null
                : Number(document.getElementById("editEventBudget").value)
    };

    try {
        await updateEvent(currentEventId, eventData);

        editEventFormContainer.classList.add("hidden");

        // רענון פרטי האירוע
        await showEventDetails(currentEventId);

        // רענון רשימת האירועים במסך הראשי
        await loadEvents();

        eventsMessage.textContent = "האירוע עודכן בהצלחה!";

        eventDetailsMessage.textContent =
            "פרטי האירוע עודכנו בהצלחה!";

    } catch (error) {
        eventDetailsMessage.textContent =
            `שגיאה בעדכון האירוע: ${error.message}`;
    }
});
deleteEventButton.addEventListener("click", async () => {
    if (!confirm("האם את בטוחה שברצונך למחוק את האירוע?")) {
        return;
    }

    try {
        await deleteEvent(currentEventId);

        currentEventId = null;

        eventDetailsSection.classList.add("hidden");
        eventsSection.classList.remove("hidden");

        await loadEvents();

        eventsMessage.textContent = "האירוע נמחק בהצלחה!";

    } catch (error) {
        eventDetailsMessage.textContent =
            `שגיאה במחיקת האירוע: ${error.message}`;
    }
});

// =====================================
// מערכת הזמנות והצטרפות לאירוע
// =====================================

// יצירת קוד הזמנה
if (createInvitationButton) {
    createInvitationButton.addEventListener("click", async () => {
        if (currentEventId == null) {
            invitationResult.textContent = "לא נבחר אירוע.";
            return;
        }

        const expiresInDays = Number(
            invitationExpiration.value
        );

        try {
            createInvitationButton.disabled = true;
            createInvitationButton.textContent = "יוצר הזמנה...";

            const invitation = await createInvitation(
                currentEventId,
                expiresInDays
            );

            const token =
                invitation.token ?? invitation.Token;

            if (!token) {
                throw new Error("לא התקבל קוד הזמנה מהשרת.");
            }

            invitationResult.innerHTML = "";

            const successMessage = document.createElement("p");
            successMessage.textContent =
                "קוד ההזמנה נוצר בהצלחה!";

            const tokenLabel = document.createElement("p");
            tokenLabel.textContent = "קוד ההזמנה שלך:";

            const tokenValue = document.createElement("strong");
            tokenValue.textContent = token;
            tokenValue.className = "invitation-token";

            const copyButton = document.createElement("button");
            copyButton.type = "button";
            copyButton.className = "secondary-button";
            copyButton.textContent = "העתקת קוד";

            copyButton.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(token);
                    copyButton.textContent = "הקוד הועתק!";
                } catch (error) {
                    invitationResult.querySelector(
                        ".copy-message"
                    ).textContent =
                        "לא ניתן להעתיק אוטומטית. אפשר לסמן ולהעתיק את הקוד.";
                }
            });

            const copyMessage = document.createElement("p");
            copyMessage.className = "copy-message";

            invitationResult.append(
                successMessage,
                tokenLabel,
                tokenValue,
                copyButton,
                copyMessage
            );

        } catch (error) {
            invitationResult.textContent =
                `שגיאה ביצירת ההזמנה: ${error.message}`;

        } finally {
            createInvitationButton.disabled = false;
            createInvitationButton.textContent =
                "יצירת קוד הזמנה";
        }
    });
}


// =====================================
// הצטרפות לאירוע באמצעות קוד
// =====================================

const joinEventForm =
    document.getElementById("joinEventForm");

const joinEventMessage =
    document.getElementById("joinEventMessage");

if (joinEventForm) {
    joinEventForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const token = document
            .getElementById("invitationToken")
            .value
            .trim();

        if (!token) {
            joinEventMessage.textContent =
                "יש להזין קוד הזמנה.";
            return;
        }

        const submitButton =
            joinEventForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.textContent = "מצטרף לאירוע...";

            await joinEventByToken(token);

            joinEventForm.reset();

            joinEventMessage.textContent =
                "הצטרפת לאירוע בהצלחה!";

            await loadEvents();

        } catch (error) {
            joinEventMessage.textContent =
                `לא ניתן להצטרף לאירוע: ${error.message}`;

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "הצטרפות לאירוע";
        }
    });
}

// =====================================
// טעינת משתתפי האירוע
// =====================================

async function loadEventMembers(eventId) {
    console.log("loadEventMembers הופעלה!", eventId);
console.log("eventMembersList:", eventMembersList);
    if (!eventMembersList || !eventMembersMessage) return;

    eventMembersList.innerHTML = "";
    eventMembersMessage.textContent = "טוען משתתפים...";

    try {
        const members = await getEventMembers(eventId);

        eventMembersMessage.textContent = "";

        if (!members || members.length === 0) {
            eventMembersMessage.textContent =
                "עדיין אין משתתפים באירוע.";
            return;
        }

        members.forEach(member => {
            const card = document.createElement("div");
            card.className = "item-card";

            const name = document.createElement("h4");
            name.textContent =
                member.userName ??
                member.UserName ??
                member.fullName ??
                member.FullName ??
                member.name ??
                member.Name ??
                "משתתף";

            const role = document.createElement("p");
            const memberRole = member.role ?? member.Role;

            role.textContent =
                memberRole === "Organizer"
                    ? "מארגנת האירוע"
                    : "משתתף";

            const joinedAt = member.joinedAt ?? member.JoinedAt;

            card.appendChild(name);
            card.appendChild(role);

            if (joinedAt) {
                const date = document.createElement("p");
                date.textContent =
                    `הצטרפות: ${new Date(joinedAt).toLocaleDateString("he-IL")}`;

                card.appendChild(date);
            }

            eventMembersList.appendChild(card);
        });

    } catch (error) {
        eventMembersMessage.textContent =
            `לא ניתן לטעון את המשתתפים: ${error.message}`;
    }
}