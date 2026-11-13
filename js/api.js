
const API_BASE_URL = "https://gatherly-server-gk3y.onrender.com/api";

async function apiRequest(endpoint, method, data = null, requiresAuth = false) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (requiresAuth) {
        const token = localStorage.getItem("gatherlyToken");

        if (!token) {
            throw new Error("יש להתחבר מחדש.");
        }

        headers.Authorization = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data !== null) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const responseText = await response.text();

    let result = null;

    try {
        result = responseText ? JSON.parse(responseText) : null;
    } catch {
        result = responseText;
    }

    if (!response.ok) {
        let message = "אירעה שגיאה, נסי שוב.";

        if (typeof result === "string") {
            message = result;
        }
        else if (result?.errors) {
            const errors = Object.values(result.errors).flat();

            message = errors.join(" ");

            if (errors.some(error =>
                error.includes("12") ||
                error.toLowerCase().includes("minimum length")
            )) {
                message = "הסיסמה חייבת להכיל לפחות 12 תווים.";
            }
        }
        else {
            message =
                result?.detail ||
                result?.message ||
                result?.Message ||
                result?.title ||
                result?.Title ||
                message;
        }

        throw new Error(message);
    }

    return result;
}


// הרשמה
async function registerUser(fullName, email, password) {
    return apiRequest("/Auth/register", "POST", {
        fullName,
        email,
        password
    });
}


// התחברות
async function loginUser(email, password) {
    return apiRequest("/Auth/login", "POST", {
        email,
        password
    });
}


// קבלת האירועים שלי
async function getMyEvents(pageNumber = 1, pageSize = 6) {
    return apiRequest(
        `/Events?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        "GET",
        null,
        true
    );
}


// יצירת אירוע
async function createEvent(eventData) {
    return apiRequest("/Events", "POST", eventData, true);
}


// קבלת פרטי אירוע
async function getEventById(eventId) {
    return apiRequest(`/Events/${eventId}`, "GET", null, true);
}


// קבלת פריטי אירוע
async function getItemsByEvent(eventId) {
    return apiRequest(
        `/Items/event/${eventId}`,
        "GET",
        null,
        true
    );
}


// יצירת פריט
async function createItem(itemData) {
    return apiRequest("/Items", "POST", itemData, true);
}


// תפיסת פריט
async function createItemClaim(itemId, quantity) {
    return apiRequest(
        "/ItemClaims",
        "POST",
        { itemId, quantity },
        true
    );
}


// קבלת התפיסות של פריט
async function getItemClaims(itemId) {
    return apiRequest(
        `/ItemClaims/item/${itemId}`,
        "GET",
        null,
        true
    );
}


// עדכון תפיסה
async function updateItemClaim(claimId, itemId, quantity) {
    return apiRequest(
        `/ItemClaims/${claimId}`,
        "PUT",
        { itemId, quantity },
        true
    );
}


// ביטול תפיסה
async function cancelItemClaim(claimId) {
    return apiRequest(
        `/ItemClaims/${claimId}`,
        "DELETE",
        null,
        true
    );
}



// קבלת הוצאות האירוע
async function getExpensesByEvent(eventId) {
    return apiRequest(
        `/Expenses/event/${eventId}`,
        "GET",
        null,
        true
    );
}

// קבלת סיכום חלוקת ההוצאות
async function getExpenseShare(eventId) {
    return apiRequest(
        `/Expenses/event/${eventId}/share`,
        "GET",
        null,
        true
    );
}

// הוספת הוצאה

async function createExpense(eventId, amount, description, itemId = null) {
    return apiRequest(
        "/Expenses",
        "POST",
        {
            eventId,
            itemId,
            amount,
            description
        },
        true
    );
}



// מחיקת הוצאה
async function deleteExpense(expenseId) {
    return apiRequest(
        `/Expenses/${expenseId}`,
        "DELETE",
        null,
        true
    );
}

// קבלת תרומות האירוע
async function getContributionsByEvent(eventId) {
    return apiRequest(
        `/Contributions/event/${eventId}`,
        "GET",
        null,
        true
    );
}

// הוספת תרומה
async function createContribution(eventId, amount) {
    return apiRequest(
        "/Contributions",
        "POST",
        { eventId, amount },
        true
    );
}

// עדכון תרומה
async function updateContribution(contributionId, eventId, amount) {
    return apiRequest(
        `/Contributions/${contributionId}`,
        "PUT",
        { eventId, amount },
        true
    );
}

// מחיקת תרומה
async function deleteContribution(contributionId) {
    return apiRequest(
        `/Contributions/${contributionId}`,
        "DELETE",
        null,
        true
    );
}
// עדכון אירוע
async function updateEvent(eventId, eventData) {
    return apiRequest(
        `/Events/${eventId}`,
        "PUT",
        eventData,
        true
    );
}

// מחיקת אירוע
async function deleteEvent(eventId) {
    return apiRequest(
        `/Events/${eventId}`,
        "DELETE",
        null,
        true
    );
}

// ===============================
// Invitations - מערכת הזמנות
// ===============================

// יצירת קוד הזמנה לאירוע
async function createInvitation(eventId, expiresInDays = 7) {
    return apiRequest(
        "/Invitations",
        "POST",
        {
            eventId,
            expiresInDays
        },
        true
    );
}

async function createInvitation(eventId, expiresInDays = 7) {
    return apiRequest(
        "/Invitations",
        "POST",
        { eventId, expiresInDays },
        true
    );
}

async function getInvitationByToken(token) {
    return apiRequest(
        `/Invitations/${encodeURIComponent(token)}`,
        "GET",
        null,
        true
    );
}

async function joinEventByToken(token) {
    return apiRequest(
        `/Invitations/${encodeURIComponent(token)}/join`,
        "POST",
        null,
        true
    );
}

async function getEventMembers(eventId) {
    return apiRequest(
        `/EventMembers/${eventId}`,
        "GET",
        null,
        true
    );
}