import type { SQLCategory, SQLProblem } from "@/lib/types";

/**
 * LeetCode SQL 50 roadmap — grouped by the seven canonical categories.
 * Explanations are written originally for PatternForge; we reference rather
 * than reproduce LeetCode problem statements.
 */

export const SQL_CATEGORIES: SQLCategory[] = [
  {
    id: "select",
    name: "Select",
    tagline: "Project, filter, rename.",
    coreIdea:
      "The foundation: pull rows that match a WHERE and shape the columns in the SELECT. 90% of SQL interviews start here — you want this reflexive.",
    keySyntax: [
      "SELECT col AS alias FROM t WHERE cond",
      "DISTINCT",
      "LIKE / IN / BETWEEN",
      "IS NULL / IS NOT NULL",
    ],
    commonMistakes: [
      "Using = NULL instead of IS NULL.",
      "Forgetting DISTINCT when the question says 'unique'.",
      "Filtering on an aliased column in WHERE (aliases are resolved after WHERE).",
    ],
    accent: "from-sky-400/30 to-cyan-400/10",
    icon: "Filter",
    order: 1,
  },
  {
    id: "joins",
    name: "Basic Joins",
    tagline: "Stitch tables together.",
    coreIdea:
      "INNER and LEFT join are 95% of interview joins. Know which table 'drives' the result and what happens to rows that don't match.",
    keySyntax: [
      "INNER JOIN b ON a.id = b.a_id",
      "LEFT JOIN (keep all left rows)",
      "USING (col)",
      "Self-join with aliases",
    ],
    commonMistakes: [
      "Using INNER when the question needs LEFT — losing rows silently.",
      "Forgetting that LEFT JOIN + WHERE b.col IS NULL is 'anti-join' (things on the left not on the right).",
      "Ambiguous column names without table aliases.",
    ],
    accent: "from-violet-400/30 to-fuchsia-400/10",
    icon: "Link2",
    order: 2,
  },
  {
    id: "aggregates",
    name: "Basic Aggregate Functions",
    tagline: "COUNT, SUM, AVG, MIN, MAX.",
    coreIdea:
      "Collapse many rows into one. Combined with GROUP BY, this is the bread and butter of analytics SQL. HAVING filters the aggregated result; WHERE filters before.",
    keySyntax: [
      "COUNT(*) / COUNT(DISTINCT col)",
      "SUM(col), AVG(col), MIN, MAX",
      "GROUP BY",
      "HAVING aggregated_cond",
    ],
    commonMistakes: [
      "Using WHERE on an aggregate (use HAVING).",
      "COUNT(col) skips NULLs — use COUNT(*) when you want every row.",
      "Forgetting every non-aggregated SELECT column must be in GROUP BY.",
    ],
    accent: "from-emerald-400/30 to-teal-400/10",
    icon: "Sigma",
    order: 3,
  },
  {
    id: "sorting-grouping",
    name: "Sorting and Grouping",
    tagline: "ORDER BY, GROUP BY, HAVING.",
    coreIdea:
      "Grouping buckets rows by a key; sorting orders the final result. The trick is sequencing: WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
    keySyntax: [
      "GROUP BY col1, col2",
      "HAVING COUNT(*) > n",
      "ORDER BY col DESC, col2 ASC",
      "LIMIT n OFFSET m",
    ],
    commonMistakes: [
      "Relying on implicit row order (there isn't one without ORDER BY).",
      "ORDER BY a column the SELECT doesn't project in some dialects.",
      "HAVING without GROUP BY — technically works but usually a logic error.",
    ],
    accent: "from-amber-400/30 to-orange-400/10",
    icon: "ArrowDownUp",
    order: 4,
  },
  {
    id: "advanced-joins",
    name: "Advanced Select and Joins",
    tagline: "Self-joins, anti-joins, CASE.",
    coreIdea:
      "Once you can join two tables, the real game begins: joining a table to itself, building conditional columns with CASE, and using CTEs to stage work.",
    keySyntax: [
      "SELF JOIN a AS a1 JOIN a AS a2",
      "CASE WHEN … THEN … ELSE … END",
      "WITH cte AS (…)",
      "COALESCE(col, default)",
    ],
    commonMistakes: [
      "Cartesian explosions on self-join — always constrain on inequality/key.",
      "Forgetting ELSE in CASE (defaults to NULL).",
      "CTE referenced before defined.",
    ],
    accent: "from-rose-400/30 to-pink-400/10",
    icon: "Shuffle",
    order: 5,
  },
  {
    id: "subqueries",
    name: "Subqueries",
    tagline: "Queries inside queries.",
    coreIdea:
      "When a filter depends on an aggregate, rank, or set from the same/another table, a subquery (or CTE, or window function) carries the day.",
    keySyntax: [
      "WHERE col IN (SELECT …)",
      "EXISTS / NOT EXISTS",
      "Correlated subquery",
      "WINDOW: RANK() / DENSE_RANK() / ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)",
    ],
    commonMistakes: [
      "IN on a subquery that returns NULLs — NOT IN breaks silently.",
      "Correlated subquery running per-row when a join would be O(n).",
      "Mixing RANK and DENSE_RANK without knowing the difference.",
    ],
    accent: "from-indigo-400/30 to-blue-400/10",
    icon: "Layers",
    order: 6,
  },
  {
    id: "advanced-string",
    name: "Advanced String / Regex / Clause",
    tagline: "Clean, transform, match.",
    coreIdea:
      "Real-world data is messy. LOWER/UPPER, TRIM, CONCAT, SUBSTRING, REGEXP_LIKE, and date functions clean and reshape it inside the query.",
    keySyntax: [
      "LOWER / UPPER / TRIM / LENGTH",
      "CONCAT(a, b) / ||",
      "SUBSTRING(col, start, len)",
      "REGEXP_LIKE(col, 'pattern')",
      "DATE_FORMAT / DATEDIFF",
    ],
    commonMistakes: [
      "Case-sensitive comparisons when you meant case-insensitive.",
      "SUBSTRING 1-indexed vs 0-indexed varies by dialect.",
      "Regex anchors missing (^ / $) → partial matches you didn't want.",
    ],
    accent: "from-lime-400/30 to-green-400/10",
    icon: "Type",
    order: 7,
  },
];

export const SQL_PROBLEMS: SQLProblem[] = [
  // -------------------- SELECT --------------------
  {
    id: "recyclable-low-fat-products",
    title: "Recyclable and Low Fat Products",
    categoryId: "select",
    difficulty: "Easy",
    learningObjective: "Combine two boolean-ish flags in a single WHERE.",
    whyItMatters:
      "If you can't nail a two-condition WHERE in 20 seconds, you're not ready for anything harder.",
    schemaHint: "Products(product_id, low_fats 'Y'/'N', recyclable 'Y'/'N')",
    approach:
      "Select product_id where both flags equal 'Y'. Nothing clever — just don't confuse AND vs OR.",
    hints: [
      "Two flags, both must be 'Y'. AND, not OR.",
      "Product id is the only column you project.",
    ],
    pitfalls: ["Using OR by reflex.", "Forgetting the quotes around 'Y'."],
    finalCode: `SELECT product_id
FROM Products
WHERE low_fats = 'Y' AND recyclable = 'Y';`,
    rememberThis: "Both flags → AND.",
  },
  {
    id: "find-customer-referee",
    title: "Find Customer Referee",
    categoryId: "select",
    difficulty: "Easy",
    learningObjective: "Handle NULL correctly in an inequality filter.",
    whyItMatters:
      "The moment you write `referee_id != 2` you lose every NULL row — classic SQL trap.",
    schemaHint: "Customer(id, name, referee_id)",
    approach:
      "NULL fails every comparison, including !=. Either combine with IS NULL or use COALESCE.",
    hints: [
      "`referee_id != 2` excludes NULLs — is that what you want?",
      "Add `OR referee_id IS NULL`.",
    ],
    pitfalls: ["Relying on != alone with nullable columns."],
    finalCode: `SELECT name
FROM Customer
WHERE referee_id != 2 OR referee_id IS NULL;`,
    rememberThis: "NULL is not equal and not-not-equal — add IS NULL explicitly.",
  },
  {
    id: "big-countries",
    title: "Big Countries",
    categoryId: "select",
    difficulty: "Easy",
    learningObjective: "OR filter on two numeric thresholds.",
    whyItMatters: "Warmup rep for compound WHERE.",
    schemaHint: "World(name, continent, area, population, gdp)",
    approach: "A country qualifies if area >= 3M OR population >= 25M.",
    hints: ["OR, not AND.", "Project name, population, area."],
    pitfalls: ["Accidentally ANDing the two."],
    finalCode: `SELECT name, population, area
FROM World
WHERE area >= 3000000 OR population >= 25000000;`,
    rememberThis: "Either condition passes → OR.",
  },
  {
    id: "article-views-i",
    title: "Article Views I",
    categoryId: "select",
    difficulty: "Easy",
    learningObjective: "DISTINCT + self-referencing filter + sort.",
    whyItMatters:
      "Three tiny pieces — DISTINCT, equality, ORDER BY — stitched for real.",
    schemaHint: "Views(article_id, author_id, viewer_id, view_date)",
    approach: "Authors who viewed their own articles = rows where author_id = viewer_id. DISTINCT on id, ORDER BY id.",
    hints: [
      "Author viewed their own article → author_id = viewer_id.",
      "DISTINCT to dedupe.",
      "ORDER BY ascending.",
    ],
    pitfalls: ["Forgetting DISTINCT and double-counting."],
    finalCode: `SELECT DISTINCT author_id AS id
FROM Views
WHERE author_id = viewer_id
ORDER BY id;`,
    rememberThis: "Self-referencing filter is just equality between two cols in the same table.",
  },
  {
    id: "invalid-tweets",
    title: "Invalid Tweets",
    categoryId: "select",
    difficulty: "Easy",
    learningObjective: "String length filter.",
    whyItMatters: "Builds the reflex that LENGTH/CHAR_LENGTH is a first-class WHERE tool.",
    schemaHint: "Tweets(tweet_id, content)",
    approach: "Return tweet_ids where CHAR_LENGTH(content) > 15.",
    hints: ["Think LENGTH vs CHAR_LENGTH — for ASCII they're the same.", "Use a WHERE filter."],
    pitfalls: ["LENGTH counts bytes in MySQL — fine for this problem but worth knowing."],
    finalCode: `SELECT tweet_id
FROM Tweets
WHERE CHAR_LENGTH(content) > 15;`,
    rememberThis: "CHAR_LENGTH = characters, LENGTH = bytes.",
  },

  // -------------------- BASIC JOINS --------------------
  {
    id: "replace-employee-id-with-unique-identifier",
    title: "Replace Employee ID With The Unique Identifier",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "LEFT JOIN to preserve all rows even without a match.",
    whyItMatters:
      "Perfect LEFT JOIN drill. If you INNER JOIN here, you lose employees who don't have a mapped ID.",
    schemaHint: "Employees(id, name), EmployeeUNI(id, unique_id)",
    approach: "LEFT JOIN Employees to EmployeeUNI on id. Project unique_id (NULL if unmatched) and name.",
    hints: [
      "Which table do you want to keep every row from?",
      "LEFT JOIN keeps the left side.",
    ],
    pitfalls: ["Using INNER JOIN — silently drops unmatched employees."],
    finalCode: `SELECT eu.unique_id, e.name
FROM Employees e
LEFT JOIN EmployeeUNI eu ON e.id = eu.id;`,
    rememberThis: "Keep all employees → LEFT JOIN from Employees.",
  },
  {
    id: "product-sales-analysis-i",
    title: "Product Sales Analysis I",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "Plain INNER JOIN with aliased projection.",
    whyItMatters: "Textbook two-table join — must be 30 seconds flat.",
    schemaHint: "Sales(sale_id, product_id, year, price), Product(product_id, product_name)",
    approach: "INNER JOIN on product_id. Project product_name, year, price.",
    hints: ["Join key is product_id.", "Project from both tables."],
    pitfalls: ["Ambiguous column references without aliases."],
    finalCode: `SELECT p.product_name, s.year, s.price
FROM Sales s
JOIN Product p ON s.product_id = p.product_id;`,
    rememberThis: "Default join = INNER. Name your tables.",
  },
  {
    id: "customer-who-visited-but-did-not-make-transactions",
    title: "Customer Who Visited but Did Not Make Any Transactions",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "LEFT JOIN + IS NULL anti-join.",
    whyItMatters:
      "The 'find things in A but not in B' pattern — worth knowing by muscle memory.",
    schemaHint: "Visits(visit_id, customer_id), Transactions(transaction_id, visit_id, amount)",
    approach: "LEFT JOIN Visits → Transactions on visit_id, then keep where transaction_id IS NULL. Group by customer, count visits.",
    hints: [
      "'Visited but didn't transact' = visits with no matching transaction.",
      "LEFT JOIN + WHERE right.col IS NULL.",
      "Then COUNT per customer.",
    ],
    pitfalls: ["Joining on customer_id instead of visit_id."],
    finalCode: `SELECT v.customer_id, COUNT(*) AS count_no_trans
FROM Visits v
LEFT JOIN Transactions t ON v.visit_id = t.visit_id
WHERE t.transaction_id IS NULL
GROUP BY v.customer_id;`,
    rememberThis: "Anti-join = LEFT JOIN + IS NULL on the right side.",
  },
  {
    id: "rising-temperature",
    title: "Rising Temperature",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "Self-join on an offset key.",
    whyItMatters:
      "The 'compare each row to a nearby row' pattern — same mental model as sliding window in arrays.",
    schemaHint: "Weather(id, recordDate, temperature)",
    approach: "Self-join Weather to itself where today.recordDate = yesterday.recordDate + 1 day, keep rows where today.temp > yesterday.temp.",
    hints: [
      "You need two rows from the same table at the same time.",
      "Self-join with a date offset.",
      "DATEDIFF(a, b) = 1.",
    ],
    pitfalls: [
      "Using day-of-month difference — fails across month boundaries.",
      "Assuming consecutive ids mean consecutive days.",
    ],
    finalCode: `SELECT w1.id
FROM Weather w1
JOIN Weather w2 ON DATEDIFF(w1.recordDate, w2.recordDate) = 1
WHERE w1.temperature > w2.temperature;`,
    rememberThis: "DATEDIFF = 1, not id - 1.",
  },
  {
    id: "average-time-of-process-per-machine",
    title: "Average Time of Process per Machine",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "Self-join on the same machine/process to compute end - start.",
    whyItMatters:
      "Start/end rows stored as two rows of the same table is the most common logging shape in the world.",
    schemaHint: "Activity(machine_id, process_id, activity_type 'start'|'end', timestamp)",
    approach: "Join the start rows to the end rows on (machine_id, process_id), subtract timestamps, AVG per machine.",
    hints: [
      "Two rows per process — one 'start', one 'end'.",
      "Self-join on (machine_id, process_id) filtering activity_type.",
      "ROUND(AVG(end - start), 3).",
    ],
    pitfalls: ["Joining on only machine_id and exploding.", "Forgetting to group by machine."],
    finalCode: `SELECT a.machine_id,
       ROUND(AVG(b.timestamp - a.timestamp), 3) AS processing_time
FROM Activity a
JOIN Activity b
  ON a.machine_id = b.machine_id
 AND a.process_id = b.process_id
 AND a.activity_type = 'start'
 AND b.activity_type = 'end'
GROUP BY a.machine_id;`,
    rememberThis: "Start/end in one table = self-join on the process key.",
  },
  {
    id: "employee-bonus",
    title: "Employee Bonus",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "LEFT JOIN + filter that tolerates NULL.",
    whyItMatters:
      "Another reflex-builder on LEFT JOIN with a NULL-tolerant filter — a very common real-world shape.",
    schemaHint: "Employee(empId, name, supervisor, salary), Bonus(empId, bonus)",
    approach: "LEFT JOIN Bonus, then keep rows where bonus < 1000 OR bonus IS NULL.",
    hints: [
      "Employees without a bonus row should still show up.",
      "LEFT JOIN, then filter with IS NULL OR.",
    ],
    pitfalls: ["`WHERE bonus < 1000` alone drops NULLs."],
    finalCode: `SELECT e.name, b.bonus
FROM Employee e
LEFT JOIN Bonus b ON e.empId = b.empId
WHERE b.bonus < 1000 OR b.bonus IS NULL;`,
    rememberThis: "LEFT JOIN + IS NULL-aware filter.",
  },
  {
    id: "students-and-examinations",
    title: "Students and Examinations",
    categoryId: "joins",
    difficulty: "Easy",
    learningObjective: "CROSS JOIN to seed every (student, subject) pair.",
    whyItMatters:
      "When you need to report zero for missing combinations, CROSS JOIN is the trick.",
    schemaHint:
      "Students(id, name), Subjects(name), Examinations(student_id, subject_name)",
    approach: "CROSS JOIN Students × Subjects, LEFT JOIN Examinations on (id, subject), COUNT(examinations.*).",
    hints: [
      "Every student should appear for every subject, even 0 attendance.",
      "CROSS JOIN first, then LEFT JOIN the exams.",
    ],
    pitfalls: ["Only joining attended rows and missing zeros."],
    finalCode: `SELECT s.student_id, s.student_name, sub.subject_name,
       COUNT(e.subject_name) AS attended_exams
FROM Students s
CROSS JOIN Subjects sub
LEFT JOIN Examinations e
  ON e.student_id = s.student_id
 AND e.subject_name = sub.subject_name
GROUP BY s.student_id, s.student_name, sub.subject_name
ORDER BY s.student_id, sub.subject_name;`,
    rememberThis: "CROSS JOIN seeds the grid, LEFT JOIN fills it.",
  },
  {
    id: "managers-with-at-least-5-direct-reports",
    title: "Managers with at Least 5 Direct Reports",
    categoryId: "joins",
    difficulty: "Medium",
    learningObjective: "Self-join + GROUP BY + HAVING.",
    whyItMatters:
      "Classic org-chart question. Proves you can see 'manager' and 'employee' as the same table.",
    schemaHint: "Employee(id, name, department, managerId)",
    approach: "Join Employee as report to Employee as manager on managerId = id. Group by manager, HAVING count >= 5.",
    hints: [
      "One row per report row — aggregate per manager.",
      "Self-join on managerId.",
      "HAVING COUNT(*) >= 5.",
    ],
    pitfalls: ["Grouping before joining and losing the manager's name."],
    finalCode: `SELECT m.name
FROM Employee e
JOIN Employee m ON e.managerId = m.id
GROUP BY m.id, m.name
HAVING COUNT(*) >= 5;`,
    rememberThis: "Manager and employee are the same table.",
  },
  {
    id: "confirmation-rate",
    title: "Confirmation Rate",
    categoryId: "joins",
    difficulty: "Medium",
    learningObjective: "LEFT JOIN + AVG over a CASE.",
    whyItMatters:
      "'Confirmation rate' is just 'AVG of a 0/1 column' — a pattern you'll see in every metrics interview.",
    schemaHint:
      "Signups(user_id, time_stamp), Confirmations(user_id, time_stamp, action 'confirmed'|'timeout')",
    approach: "LEFT JOIN confirmations onto signups. AVG(CASE WHEN action = 'confirmed' THEN 1 ELSE 0 END), grouped by user.",
    hints: [
      "Keep every signup — LEFT JOIN.",
      "Turn action into 0/1 with CASE, then AVG.",
      "ROUND to 2 decimals.",
    ],
    pitfalls: ["COUNT ratios with NULL handling slip-ups."],
    finalCode: `SELECT s.user_id,
       ROUND(AVG(CASE WHEN c.action = 'confirmed' THEN 1 ELSE 0 END), 2) AS confirmation_rate
FROM Signups s
LEFT JOIN Confirmations c ON s.user_id = c.user_id
GROUP BY s.user_id;`,
    rememberThis: "Rate = AVG(CASE WHEN condition THEN 1 ELSE 0 END).",
  },

  // -------------------- BASIC AGGREGATE FUNCTIONS --------------------
  {
    id: "not-boring-movies",
    title: "Not Boring Movies",
    categoryId: "aggregates",
    difficulty: "Easy",
    learningObjective: "Odd-id filter + ORDER BY rating DESC.",
    whyItMatters: "Warmup that mixes filter + sort.",
    schemaHint: "Cinema(id, movie, description, rating)",
    approach: "WHERE id is odd AND description != 'boring', ORDER BY rating DESC.",
    hints: ["id % 2 = 1.", "description != 'boring'.", "Sort desc by rating."],
    pitfalls: ["Using MOD vs % inconsistently across dialects."],
    finalCode: `SELECT id, movie, description, rating
FROM Cinema
WHERE id % 2 = 1 AND description <> 'boring'
ORDER BY rating DESC;`,
    rememberThis: "Odd → id % 2 = 1.",
  },
  {
    id: "average-selling-price",
    title: "Average Selling Price",
    categoryId: "aggregates",
    difficulty: "Easy",
    learningObjective: "Weighted average via join + GROUP BY.",
    whyItMatters:
      "Real-world 'average price' is always weighted by units. Know the SUM/SUM form.",
    schemaHint:
      "Prices(product_id, start_date, end_date, price), UnitsSold(product_id, purchase_date, units)",
    approach:
      "Join on product_id where purchase_date falls inside price's [start, end]. SUM(price*units)/SUM(units), grouped by product.",
    hints: [
      "Join must be range-based on date.",
      "Average = SUM(price * units) / SUM(units).",
      "LEFT JOIN + COALESCE 0 if a product might have zero sales.",
    ],
    pitfalls: [
      "Computing AVG(price) — that's unweighted and wrong.",
      "Integer division if your dialect defaults to int.",
    ],
    finalCode: `SELECT p.product_id,
       ROUND(COALESCE(SUM(p.price * u.units) / NULLIF(SUM(u.units), 0), 0), 2) AS average_price
FROM Prices p
LEFT JOIN UnitsSold u
  ON p.product_id = u.product_id
 AND u.purchase_date BETWEEN p.start_date AND p.end_date
GROUP BY p.product_id;`,
    rememberThis: "Weighted avg = SUM(x*w) / SUM(w).",
  },
  {
    id: "project-employees-i",
    title: "Project Employees I",
    categoryId: "aggregates",
    difficulty: "Easy",
    learningObjective: "Join + AVG grouped by project.",
    whyItMatters: "Clean two-table AVG pattern.",
    schemaHint: "Project(project_id, employee_id), Employee(employee_id, name, experience_years)",
    approach: "Join on employee_id, GROUP BY project_id, AVG(experience_years), ROUND to 2.",
    hints: ["INNER JOIN.", "Group by project.", "ROUND(AVG(…), 2)."],
    pitfalls: ["Forgetting ROUND."],
    finalCode: `SELECT p.project_id,
       ROUND(AVG(e.experience_years), 2) AS average_years
FROM Project p
JOIN Employee e ON p.employee_id = e.employee_id
GROUP BY p.project_id;`,
    rememberThis: "ROUND(AVG, 2) is the canonical shape.",
  },
  {
    id: "percentage-of-users-attended-a-contest",
    title: "Percentage of Users Attended a Contest",
    categoryId: "aggregates",
    difficulty: "Easy",
    learningObjective: "Ratio of a group count to a total — the most common metric shape.",
    whyItMatters:
      "Any time you hear 'percent of', your instinct should be: count numerator / count denominator × 100.",
    schemaHint: "Users(user_id, user_name), Register(contest_id, user_id)",
    approach:
      "GROUP BY contest_id on Register, COUNT(DISTINCT user_id), divide by total users (scalar subquery), × 100, ROUND 2, ORDER BY percentage DESC, contest_id ASC.",
    hints: [
      "Numerator: distinct users registered per contest.",
      "Denominator: total users — a scalar subquery.",
      "Multiply by 100.0 to force float.",
    ],
    pitfalls: ["Integer division in some dialects — multiply by 100.0 first."],
    finalCode: `SELECT contest_id,
       ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM Users), 2) AS percentage
FROM Register
GROUP BY contest_id
ORDER BY percentage DESC, contest_id ASC;`,
    rememberThis: "Part/whole × 100. Force float with *100.0.",
  },
  {
    id: "queries-quality-and-percentage",
    title: "Queries Quality and Percentage",
    categoryId: "aggregates",
    difficulty: "Easy",
    learningObjective: "AVG of a ratio + AVG of a boolean CASE, together.",
    whyItMatters: "Two metrics in one SELECT — trains composing aggregates cleanly.",
    schemaHint: "Queries(query_name, result, position, rating)",
    approach:
      "AVG(rating/position) for quality, AVG(CASE WHEN rating<3 THEN 1 ELSE 0 END)*100 for poor_query_percentage.",
    hints: [
      "Quality is AVG of a per-row ratio.",
      "Percentage is AVG of a 0/1 CASE × 100.",
    ],
    pitfalls: ["Filtering out nulls in WHERE accidentally."],
    finalCode: `SELECT query_name,
       ROUND(AVG(rating * 1.0 / position), 2) AS quality,
       ROUND(AVG(CASE WHEN rating < 3 THEN 1 ELSE 0 END) * 100, 2) AS poor_query_percentage
FROM Queries
WHERE query_name IS NOT NULL
GROUP BY query_name;`,
    rememberThis: "Quality = AVG(ratio). Poor% = AVG(CASE) × 100.",
  },
  {
    id: "monthly-transactions-i",
    title: "Monthly Transactions I",
    categoryId: "aggregates",
    difficulty: "Medium",
    learningObjective: "Group by a formatted date + country, plus conditional sums.",
    whyItMatters:
      "Every cohort/time-series dashboard ever is this problem. Learn it once.",
    schemaHint: "Transactions(id, country, state 'approved'|'declined', amount, trans_date)",
    approach:
      "GROUP BY DATE_FORMAT(trans_date, '%Y-%m'), country. COUNT(*) for total, SUM(amount) for total_amount, and SUM(CASE state='approved' …) for approved totals.",
    hints: [
      "Month bucket = DATE_FORMAT.",
      "Conditional counts = SUM(CASE WHEN cond THEN 1 ELSE 0 END).",
      "Group by both month and country.",
    ],
    pitfalls: ["Grouping by full date — collapses the wrong way.", "Counting approved with COUNT(CASE …) — works but SUM is cleaner."],
    finalCode: `SELECT DATE_FORMAT(trans_date, '%Y-%m') AS month,
       country,
       COUNT(*) AS trans_count,
       SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,
       SUM(amount) AS trans_total_amount,
       SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount
FROM Transactions
GROUP BY month, country;`,
    rememberThis: "Conditional aggregate = SUM(CASE WHEN cond THEN x ELSE 0 END).",
  },
  {
    id: "immediate-food-delivery-ii",
    title: "Immediate Food Delivery II",
    categoryId: "aggregates",
    difficulty: "Medium",
    learningObjective: "Subquery for 'first order per customer' + ratio aggregate.",
    whyItMatters: "Teaches the two-step: pick one row per customer, then aggregate.",
    schemaHint: "Delivery(delivery_id, customer_id, order_date, customer_pref_delivery_date)",
    approach:
      "Subquery: for each customer_id, MIN(order_date). Join back to Delivery. Then AVG(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) * 100.",
    hints: [
      "Immediate = order_date == preferred date.",
      "First = MIN(order_date) per customer.",
      "Then it's just a percentage on the filtered set.",
    ],
    pitfalls: ["Picking earliest via LIMIT per customer — won't work in a single scan."],
    finalCode: `SELECT ROUND(
  AVG(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) * 100,
  2
) AS immediate_percentage
FROM Delivery
WHERE (customer_id, order_date) IN (
  SELECT customer_id, MIN(order_date) FROM Delivery GROUP BY customer_id
);`,
    rememberThis: "First-per-group = (key, MIN(date)) tuple IN subquery.",
  },
  {
    id: "game-play-analysis-iv",
    title: "Game Play Analysis IV",
    categoryId: "aggregates",
    difficulty: "Medium",
    learningObjective: "Day-after retention metric via self-matched dates.",
    whyItMatters:
      "Retention is the metric every product analyst lives and dies by. This is its simplest form.",
    schemaHint: "Activity(player_id, device_id, event_date, games_played)",
    approach:
      "Find each player's first login. Check if they also have a login on first_login + 1 day. Ratio = matched / total distinct players.",
    hints: [
      "First login = MIN(event_date) per player.",
      "Check EXISTS for login on first_login + 1.",
      "Ratio vs total distinct players.",
    ],
    pitfalls: ["Counting total players from Activity with duplicates — use DISTINCT."],
    finalCode: `SELECT ROUND(
  COUNT(DISTINCT a.player_id) * 1.0 /
  (SELECT COUNT(DISTINCT player_id) FROM Activity),
  2
) AS fraction
FROM Activity a
JOIN (
  SELECT player_id, MIN(event_date) AS first_date
  FROM Activity
  GROUP BY player_id
) f ON a.player_id = f.player_id
  AND a.event_date = DATE_ADD(f.first_date, INTERVAL 1 DAY);`,
    rememberThis: "Retention = join to (MIN(date) + 1 day).",
  },

  // -------------------- SORTING AND GROUPING --------------------
  {
    id: "number-of-unique-subjects-taught-by-each-teacher",
    title: "Number of Unique Subjects Taught by Each Teacher",
    categoryId: "sorting-grouping",
    difficulty: "Easy",
    learningObjective: "COUNT DISTINCT grouped by a key.",
    whyItMatters: "Reflex rep for COUNT DISTINCT.",
    schemaHint: "Teacher(teacher_id, subject_id, dept_id)",
    approach: "GROUP BY teacher_id, COUNT(DISTINCT subject_id).",
    hints: ["DISTINCT matters — same subject in multiple depts counts once."],
    pitfalls: ["COUNT(*) instead of COUNT(DISTINCT)."],
    finalCode: `SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt
FROM Teacher
GROUP BY teacher_id;`,
    rememberThis: "'Unique' → COUNT(DISTINCT …).",
  },
  {
    id: "user-activity-for-the-past-30-days-i",
    title: "User Activity for the Past 30 Days I",
    categoryId: "sorting-grouping",
    difficulty: "Easy",
    learningObjective: "Date-window filter + daily active users.",
    whyItMatters: "DAU is the canonical product metric.",
    schemaHint: "Activity(user_id, session_id, activity_date, activity_type)",
    approach: "WHERE activity_date BETWEEN ('2019-07-27' - 29 days) AND '2019-07-27'. GROUP BY date, COUNT DISTINCT user.",
    hints: [
      "'Past 30 days inclusive' = 30-day window ending on a given date.",
      "Count distinct users per day.",
    ],
    pitfalls: ["Off-by-one on the window — 30 days inclusive is ≥ date - 29."],
    finalCode: `SELECT activity_date AS day,
       COUNT(DISTINCT user_id) AS active_users
FROM Activity
WHERE activity_date BETWEEN DATE_SUB('2019-07-27', INTERVAL 29 DAY) AND '2019-07-27'
GROUP BY activity_date;`,
    rememberThis: "DAU = COUNT(DISTINCT user) per day in window.",
  },
  {
    id: "product-sales-analysis-iii",
    title: "Product Sales Analysis III",
    categoryId: "sorting-grouping",
    difficulty: "Medium",
    learningObjective: "Find each group's minimum row.",
    whyItMatters: "First-year / earliest-per-group is the single most common interview shape.",
    schemaHint: "Sales(sale_id, product_id, year, quantity, price)",
    approach:
      "Subquery: MIN(year) per product. Join back to Sales on (product_id, min_year).",
    hints: [
      "For each product, get MIN(year).",
      "Join back so you can grab the full row.",
    ],
    pitfalls: [
      "Trying to SELECT year, quantity, price along with MIN(year) — other cols need to come from a join.",
    ],
    finalCode: `SELECT s.product_id, s.year AS first_year, s.quantity, s.price
FROM Sales s
JOIN (
  SELECT product_id, MIN(year) AS first_year
  FROM Sales
  GROUP BY product_id
) f ON s.product_id = f.product_id AND s.year = f.first_year;`,
    rememberThis: "Earliest-per-group = join back to MIN-subquery.",
  },
  {
    id: "classes-more-than-5-students",
    title: "Classes More Than 5 Students",
    categoryId: "sorting-grouping",
    difficulty: "Easy",
    learningObjective: "GROUP BY + HAVING COUNT.",
    whyItMatters: "Prototype for HAVING. Nothing fancier.",
    schemaHint: "Courses(student, class)",
    approach: "GROUP BY class, HAVING COUNT(student) >= 5.",
    hints: ["Filter groups with HAVING, not WHERE."],
    pitfalls: ["Trying WHERE COUNT(*) ≥ 5."],
    finalCode: `SELECT class
FROM Courses
GROUP BY class
HAVING COUNT(student) >= 5;`,
    rememberThis: "Filter aggregates with HAVING.",
  },
  {
    id: "find-followers-count",
    title: "Find Followers Count",
    categoryId: "sorting-grouping",
    difficulty: "Easy",
    learningObjective: "Simple GROUP BY + ORDER BY.",
    whyItMatters: "Two-line rep that should be automatic.",
    schemaHint: "Followers(user_id, follower_id)",
    approach: "GROUP BY user_id, COUNT(*). ORDER BY user_id.",
    hints: ["COUNT(*) per user, sort ascending."],
    pitfalls: [],
    finalCode: `SELECT user_id, COUNT(*) AS followers_count
FROM Followers
GROUP BY user_id
ORDER BY user_id;`,
    rememberThis: "GROUP BY + ORDER BY — tuple of one-liner.",
  },
  {
    id: "biggest-single-number",
    title: "Biggest Single Number",
    categoryId: "sorting-grouping",
    difficulty: "Easy",
    learningObjective: "Subquery of groups with COUNT = 1, then MAX.",
    whyItMatters: "Classic 'only values that appear once' setup.",
    schemaHint: "MyNumbers(num)",
    approach:
      "Subquery: nums with COUNT = 1. Outer: MAX of those (or NULL).",
    hints: [
      "GROUP BY num HAVING COUNT(*) = 1.",
      "Wrap in MAX so the result is one row.",
    ],
    pitfalls: ["Returning multiple rows when the prompt wants one value (NULL if none)."],
    finalCode: `SELECT MAX(num) AS num
FROM (
  SELECT num FROM MyNumbers GROUP BY num HAVING COUNT(*) = 1
) t;`,
    rememberThis: "Appears once = GROUP BY + HAVING COUNT = 1.",
  },
  {
    id: "customers-who-bought-all-products",
    title: "Customers Who Bought All Products",
    categoryId: "sorting-grouping",
    difficulty: "Medium",
    learningObjective: "Relational division: customers whose distinct products = total products.",
    whyItMatters:
      "'Bought all X' is the cleanest relational-division problem. Learn the pattern once.",
    schemaHint: "Customer(customer_id, product_key), Product(product_key)",
    approach: "GROUP BY customer_id HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product).",
    hints: [
      "'All' means count matches the total product count.",
      "Scalar subquery for the total.",
      "COUNT(DISTINCT) to be safe against duplicates.",
    ],
    pitfalls: ["Plain COUNT(*) when duplicates exist."],
    finalCode: `SELECT customer_id
FROM Customer
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM Product);`,
    rememberThis: "Bought all = COUNT(DISTINCT) matches total.",
  },

  // -------------------- ADVANCED SELECT AND JOINS --------------------
  {
    id: "the-number-of-employees-which-report-to-each-employee",
    title: "The Number of Employees Which Report to Each Employee",
    categoryId: "advanced-joins",
    difficulty: "Easy",
    learningObjective: "Self-join + aggregate report count and AVG age.",
    whyItMatters: "Puts self-join and GROUP BY together.",
    schemaHint: "Employees(employee_id, name, reports_to, age)",
    approach:
      "Join Employees as reports to Employees as manager on reports_to = employee_id. Group by manager, COUNT(reports) and AVG(age) rounded up.",
    hints: [
      "Self-join on reports_to = employee_id.",
      "HAVING reports >= 1 or just use an INNER join to drop non-managers.",
    ],
    pitfalls: ["LEFT joining and keeping non-managers."],
    finalCode: `SELECT m.employee_id, m.name,
       COUNT(*) AS reports_count,
       ROUND(AVG(r.age)) AS average_age
FROM Employees r
JOIN Employees m ON r.reports_to = m.employee_id
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id;`,
    rememberThis: "Manager = the row everyone else's reports_to points to.",
  },
  {
    id: "primary-department-for-each-employee",
    title: "Primary Department for Each Employee",
    categoryId: "advanced-joins",
    difficulty: "Easy",
    learningObjective: "Two-branch UNION or CASE on an is_primary flag.",
    whyItMatters: "Trains you to think in 'branches that UNION together'.",
    schemaHint: "Employee(employee_id, department_id, primary_flag 'Y'|'N')",
    approach:
      "Either UNION (primary='Y') with (employees with only one dept) or use a subquery filter.",
    hints: [
      "Anyone flagged Y is primary.",
      "Anyone with exactly one department is also primary.",
    ],
    pitfalls: ["Double-counting when an employee has both a single dept AND a Y flag."],
    finalCode: `SELECT employee_id, department_id
FROM Employee
WHERE primary_flag = 'Y'
UNION
SELECT employee_id, department_id
FROM Employee
GROUP BY employee_id
HAVING COUNT(*) = 1;`,
    rememberThis: "Two branches → UNION.",
  },
  {
    id: "triangle-judgement",
    title: "Triangle Judgement",
    categoryId: "advanced-joins",
    difficulty: "Easy",
    learningObjective: "CASE WHEN for a boolean-valued column.",
    whyItMatters: "Most minimal CASE rep possible.",
    schemaHint: "Triangle(x, y, z)",
    approach: "CASE based on triangle inequality — each pair sums > the third side.",
    hints: ["Three inequalities, all must hold."],
    pitfalls: ["Missing one of the three inequalities."],
    finalCode: `SELECT x, y, z,
       CASE WHEN x + y > z AND x + z > y AND y + z > x
            THEN 'Yes' ELSE 'No' END AS triangle
FROM Triangle;`,
    rememberThis: "CASE WHEN cond THEN a ELSE b END.",
  },
  {
    id: "consecutive-numbers",
    title: "Consecutive Numbers",
    categoryId: "advanced-joins",
    difficulty: "Medium",
    learningObjective: "Triple self-join on consecutive ids.",
    whyItMatters: "Classic 'find runs' trick pre-window functions.",
    schemaHint: "Logs(id, num)",
    approach: "Join Logs l1, l2, l3 on l2.id = l1.id+1 and l3.id = l2.id+1, keep rows where all three nums equal. DISTINCT the result.",
    hints: [
      "Three rows → three aliases.",
      "Chain id = id+1.",
      "Return DISTINCT num.",
    ],
    pitfalls: ["Missing DISTINCT and returning dupes."],
    finalCode: `SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l2.id = l1.id + 1
JOIN Logs l3 ON l3.id = l1.id + 2
WHERE l1.num = l2.num AND l2.num = l3.num;`,
    rememberThis: "Consecutive runs → N-way self-join on id.",
  },
  {
    id: "product-price-at-a-given-date",
    title: "Product Price at a Given Date",
    categoryId: "advanced-joins",
    difficulty: "Medium",
    learningObjective: "Latest-before-date per key, with fallback to default.",
    whyItMatters:
      "This is 'what's the current/effective value' — a huge class of real queries.",
    schemaHint: "Products(product_id, new_price, change_date)",
    approach:
      "Left branch: products with a change on or before 2019-08-16, take MAX(change_date) per product and pull new_price. Right branch (UNION): products with no early change, default 10.",
    hints: [
      "Find the latest change_date ≤ target date per product.",
      "Products with no early change default to 10.",
      "UNION the two sets.",
    ],
    pitfalls: ["Forgetting the fallback default of 10."],
    finalCode: `SELECT p.product_id, p.new_price AS price
FROM Products p
JOIN (
  SELECT product_id, MAX(change_date) AS latest
  FROM Products
  WHERE change_date <= '2019-08-16'
  GROUP BY product_id
) m ON p.product_id = m.product_id AND p.change_date = m.latest

UNION

SELECT product_id, 10 AS price
FROM Products
GROUP BY product_id
HAVING MIN(change_date) > '2019-08-16';`,
    rememberThis: "Effective-value = join to MAX(date ≤ target), with default fallback.",
  },
  {
    id: "last-person-to-fit-in-the-bus",
    title: "Last Person to Fit in the Bus",
    categoryId: "advanced-joins",
    difficulty: "Medium",
    learningObjective: "Running SUM via self-join or window function.",
    whyItMatters: "Running total is the most common use of window functions.",
    schemaHint: "Queue(person_id, person_name, weight, turn)",
    approach:
      "Window: SUM(weight) OVER (ORDER BY turn). Filter where running ≤ 1000. Take last row.",
    hints: [
      "Window function rather than self-join.",
      "Sum up weights in turn order.",
    ],
    pitfalls: ["Running total via self-join scales O(n²)."],
    finalCode: `SELECT person_name
FROM (
  SELECT person_name, weight, turn,
         SUM(weight) OVER (ORDER BY turn) AS running_weight
  FROM Queue
) q
WHERE running_weight <= 1000
ORDER BY turn DESC
LIMIT 1;`,
    rememberThis: "Running total = SUM() OVER (ORDER BY …).",
  },
  {
    id: "count-salary-categories",
    title: "Count Salary Categories",
    categoryId: "advanced-joins",
    difficulty: "Medium",
    learningObjective: "UNION of three 'bucket' counts including zero categories.",
    whyItMatters:
      "Buckets that can be zero is a trap — GROUP BY drops them. UNION of hardcoded labels fixes it.",
    schemaHint: "Accounts(account_id, income)",
    approach:
      "Three SELECTs — one per category — each returning the category name and a COUNT. UNION ALL them.",
    hints: [
      "Each bucket is its own SELECT.",
      "UNION ALL to keep all three rows even if one is zero.",
    ],
    pitfalls: ["GROUP BY category_label — zero-count buckets vanish."],
    finalCode: `SELECT 'Low Salary' AS category,
       SUM(CASE WHEN income < 20000 THEN 1 ELSE 0 END) AS accounts_count
FROM Accounts
UNION ALL
SELECT 'Average Salary',
       SUM(CASE WHEN income BETWEEN 20000 AND 50000 THEN 1 ELSE 0 END)
FROM Accounts
UNION ALL
SELECT 'High Salary',
       SUM(CASE WHEN income > 50000 THEN 1 ELSE 0 END)
FROM Accounts;`,
    rememberThis: "Zero buckets need UNION of hardcoded labels.",
  },

  // -------------------- SUBQUERIES --------------------
  {
    id: "employees-whose-manager-left-the-company",
    title: "Employees Whose Manager Left the Company",
    categoryId: "subqueries",
    difficulty: "Easy",
    learningObjective: "NOT IN subquery with a salary filter.",
    whyItMatters: "Minimal 'referenced id that no longer exists' query.",
    schemaHint: "Employees(employee_id, name, manager_id, salary)",
    approach:
      "WHERE salary < 30000 AND manager_id IS NOT NULL AND manager_id NOT IN (SELECT employee_id FROM Employees).",
    hints: [
      "Employee has a manager_id that doesn't exist as an employee_id.",
      "Plus salary filter.",
    ],
    pitfalls: ["NOT IN with NULLs — guard with IS NOT NULL."],
    finalCode: `SELECT employee_id
FROM Employees
WHERE salary < 30000
  AND manager_id IS NOT NULL
  AND manager_id NOT IN (SELECT employee_id FROM Employees)
ORDER BY employee_id;`,
    rememberThis: "NOT IN subquery — watch NULLs.",
  },
  {
    id: "exchange-seats",
    title: "Exchange Seats",
    categoryId: "subqueries",
    difficulty: "Medium",
    learningObjective: "CASE based on odd/even id and max id.",
    whyItMatters: "Swapping neighbors is a tidy CASE-expression drill.",
    schemaHint: "Seat(id, student)",
    approach:
      "If id is odd and not the last, swap with id+1. If id is even, swap with id-1. Else keep.",
    hints: [
      "Three cases: odd-not-last, even, odd-last.",
      "Use a scalar subquery for the max id.",
    ],
    pitfalls: ["Forgetting the boundary case where the last id is odd."],
    finalCode: `SELECT
  CASE
    WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id
    WHEN id % 2 = 1 THEN id + 1
    ELSE id - 1
  END AS id,
  student
FROM Seat
ORDER BY id;`,
    rememberThis: "Swap neighbors with CASE on parity.",
  },
  {
    id: "movie-rating",
    title: "Movie Rating",
    categoryId: "subqueries",
    difficulty: "Medium",
    learningObjective: "Two independent top-1 queries UNIONed.",
    whyItMatters: "Teaches 'answer is two separate facts, glue with UNION'.",
    schemaHint:
      "Movies(movie_id, title), Users(user_id, name), MovieRating(movie_id, user_id, rating, created_at)",
    approach:
      "Q1: user with most ratings (tie-break by name). Q2: movie with highest avg rating in Feb 2020 (tie-break by title). UNION ALL.",
    hints: [
      "Each half is an independent ORDER BY + LIMIT 1.",
      "UNION ALL them and name the column 'results'.",
    ],
    pitfalls: ["Forgetting the tie-breaker."],
    finalCode: `(SELECT u.name AS results
 FROM MovieRating r JOIN Users u ON r.user_id = u.user_id
 GROUP BY u.user_id, u.name
 ORDER BY COUNT(*) DESC, u.name ASC
 LIMIT 1)
UNION ALL
(SELECT m.title AS results
 FROM MovieRating r JOIN Movies m ON r.movie_id = m.movie_id
 WHERE r.created_at BETWEEN '2020-02-01' AND '2020-02-29'
 GROUP BY m.movie_id, m.title
 ORDER BY AVG(r.rating) DESC, m.title ASC
 LIMIT 1);`,
    rememberThis: "Two asks, one shape — UNION ALL.",
  },
  {
    id: "restaurant-growth",
    title: "Restaurant Growth",
    categoryId: "subqueries",
    difficulty: "Medium",
    learningObjective: "7-day moving average over daily totals.",
    whyItMatters: "Moving averages are one of the most common dashboard asks.",
    schemaHint: "Customer(customer_id, name, visited_on, amount)",
    approach: "First aggregate amount per day, then 7-day window (ROWS 6 PRECEDING).",
    hints: [
      "Step 1: SUM by visited_on.",
      "Step 2: SUM/AVG OVER (ORDER BY visited_on ROWS 6 PRECEDING).",
      "Skip the first 6 days (not enough window).",
    ],
    pitfalls: ["Averaging before aggregating daily totals."],
    finalCode: `WITH daily AS (
  SELECT visited_on, SUM(amount) AS day_total
  FROM Customer
  GROUP BY visited_on
)
SELECT visited_on,
       SUM(day_total) OVER (ORDER BY visited_on ROWS 6 PRECEDING) AS amount,
       ROUND(AVG(day_total) OVER (ORDER BY visited_on ROWS 6 PRECEDING), 2) AS average_amount
FROM daily
ORDER BY visited_on
OFFSET 6 ROWS;`,
    rememberThis: "Moving window = OVER (ORDER BY … ROWS N PRECEDING).",
  },
  {
    id: "friend-requests-ii",
    title: "Friend Requests II: Who Has the Most Friends",
    categoryId: "subqueries",
    difficulty: "Medium",
    learningObjective: "Union both sides of a directed friendship edge.",
    whyItMatters: "Directed→undirected conversion is the whole game with edge tables.",
    schemaHint: "RequestAccepted(requester_id, accepter_id, accept_date)",
    approach: "UNION ALL both sides into one column, GROUP BY id, ORDER BY count DESC, LIMIT 1.",
    hints: [
      "Each accepted row contributes one friend to each side.",
      "UNION ALL (requester_id) + (accepter_id) into one column.",
    ],
    pitfalls: ["UNION (with dedupe) silently dropping duplicates across sides."],
    finalCode: `SELECT id, COUNT(*) AS num
FROM (
  SELECT requester_id AS id FROM RequestAccepted
  UNION ALL
  SELECT accepter_id AS id FROM RequestAccepted
) t
GROUP BY id
ORDER BY num DESC
LIMIT 1;`,
    rememberThis: "Both sides contribute — UNION ALL.",
  },
  {
    id: "investments-in-2016",
    title: "Investments in 2016",
    categoryId: "subqueries",
    difficulty: "Medium",
    learningObjective: "Two correlated-aggregate filters.",
    whyItMatters:
      "Forces composing two independent constraints on groups of the same table.",
    schemaHint: "Insurance(pid, tiv_2015, tiv_2016, lat, lon)",
    approach:
      "Keep rows where tiv_2015 appears >1x AND (lat,lon) appears exactly once. SUM tiv_2016.",
    hints: [
      "Two filters: duplicate tiv_2015, unique location.",
      "Both can be scalar subqueries via COUNT OVER PARTITION BY or IN lists.",
    ],
    pitfalls: ["Joining on tiv_2015 and exploding the row count."],
    finalCode: `SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM (
  SELECT tiv_2016,
         COUNT(*) OVER (PARTITION BY tiv_2015) AS c15,
         COUNT(*) OVER (PARTITION BY lat, lon) AS cloc
  FROM Insurance
) t
WHERE c15 > 1 AND cloc = 1;`,
    rememberThis: "Two group-count constraints → window COUNTs in one pass.",
  },
  {
    id: "department-top-three-salaries",
    title: "Department Top Three Salaries",
    categoryId: "subqueries",
    difficulty: "Hard",
    learningObjective: "DENSE_RANK per partition.",
    whyItMatters: "The definitive window-function interview problem.",
    schemaHint: "Employee(id, name, salary, departmentId), Department(id, name)",
    approach: "DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) ≤ 3.",
    hints: [
      "'Top three distinct salaries' → DENSE_RANK, not RANK or ROW_NUMBER.",
      "PARTITION BY department.",
    ],
    pitfalls: ["RANK skips ranks on ties, giving fewer than three distinct salaries."],
    finalCode: `SELECT d.name AS Department,
       e.name AS Employee,
       e.salary AS Salary
FROM (
  SELECT id, name, salary, departmentId,
         DENSE_RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) AS rk
  FROM Employee
) e
JOIN Department d ON e.departmentId = d.id
WHERE e.rk <= 3;`,
    rememberThis: "Top N distinct per group = DENSE_RANK.",
  },

  // -------------------- ADVANCED STRING / REGEX / CLAUSE --------------------
  {
    id: "fix-names-in-a-table",
    title: "Fix Names in a Table",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "CONCAT + UPPER/LOWER + SUBSTRING for title case.",
    whyItMatters: "String cleanup 101.",
    schemaHint: "Users(user_id, name)",
    approach: "CONCAT(UPPER(first char), LOWER(rest)). ORDER BY user_id.",
    hints: [
      "SUBSTRING(name, 1, 1) for first char.",
      "SUBSTRING(name, 2) for the rest.",
    ],
    pitfalls: ["Off-by-one in SUBSTRING indices."],
    finalCode: `SELECT user_id,
       CONCAT(UPPER(SUBSTRING(name, 1, 1)), LOWER(SUBSTRING(name, 2))) AS name
FROM Users
ORDER BY user_id;`,
    rememberThis: "Title case = UPPER(1st char) || LOWER(rest).",
  },
  {
    id: "patients-with-a-condition",
    title: "Patients With a Condition",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "LIKE with word-boundary matching for tokenized conditions.",
    whyItMatters: "A classic 'LIKE isn't enough without anchoring' trap.",
    schemaHint: "Patients(patient_id, patient_name, conditions)",
    approach: "conditions starts with 'DIAB1' OR contains ' DIAB1' (leading space).",
    hints: [
      "Substring match can false-match PREDIAB1.",
      "Two LIKEs — one for start, one for middle.",
    ],
    pitfalls: ["LIKE '%DIAB1%' — matches PREDIAB1."],
    finalCode: `SELECT *
FROM Patients
WHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%';`,
    rememberThis: "LIKE without anchors matches substrings — anchor the boundary.",
  },
  {
    id: "delete-duplicate-emails",
    title: "Delete Duplicate Emails",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "DELETE with self-join — keep the smallest id per email.",
    whyItMatters: "The standard 'dedupe in place' pattern.",
    schemaHint: "Person(id, email)",
    approach: "DELETE p1 FROM Person p1 JOIN Person p2 ON p1.email = p2.email AND p1.id > p2.id.",
    hints: [
      "Join Person to itself on email with id > other id.",
      "DELETE the row with the larger id.",
    ],
    pitfalls: ["Using a subquery DELETE that references the same table without aliasing."],
    finalCode: `DELETE p1
FROM Person p1
JOIN Person p2 ON p1.email = p2.email AND p1.id > p2.id;`,
    rememberThis: "Dedupe = delete any row with a same-key twin of smaller id.",
  },
  {
    id: "second-highest-salary",
    title: "Second Highest Salary",
    categoryId: "advanced-string",
    difficulty: "Medium",
    learningObjective: "LIMIT + OFFSET wrapped so empty result returns NULL.",
    whyItMatters: "Trivial answer that hides a NULL edge case.",
    schemaHint: "Employee(id, salary)",
    approach: "DISTINCT salary ORDER BY DESC LIMIT 1 OFFSET 1, wrap in a subquery to coalesce to NULL.",
    hints: [
      "DISTINCT so duplicate salaries don't confuse ordering.",
      "Wrap in outer SELECT so empty result → NULL.",
    ],
    pitfalls: ["Bare LIMIT query returns no row when there's no 2nd salary."],
    finalCode: `SELECT (
  SELECT DISTINCT salary
  FROM Employee
  ORDER BY salary DESC
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
    rememberThis: "Wrap LIMIT/OFFSET in a scalar subquery to get NULL when empty.",
  },
  {
    id: "group-sold-products-by-the-date",
    title: "Group Sold Products By The Date",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "GROUP_CONCAT with ordering.",
    whyItMatters: "Flattening a group into a comma list is a common reporting ask.",
    schemaHint: "Activities(sell_date, product)",
    approach: "GROUP BY sell_date, COUNT DISTINCT product, GROUP_CONCAT(DISTINCT product ORDER BY product).",
    hints: [
      "DISTINCT inside GROUP_CONCAT to dedupe.",
      "ORDER BY inside GROUP_CONCAT for a stable list.",
    ],
    pitfalls: ["Forgetting ORDER BY → non-deterministic lists."],
    finalCode: `SELECT sell_date,
       COUNT(DISTINCT product) AS num_sold,
       GROUP_CONCAT(DISTINCT product ORDER BY product SEPARATOR ',') AS products
FROM Activities
GROUP BY sell_date
ORDER BY sell_date;`,
    rememberThis: "GROUP_CONCAT(DISTINCT x ORDER BY x SEPARATOR ',') is the canonical shape.",
  },
  {
    id: "list-the-products-ordered-in-a-period",
    title: "List the Products Ordered in a Period",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "Date filter + GROUP BY + HAVING.",
    whyItMatters: "All four clauses in one short query — great muscle memory rep.",
    schemaHint: "Products(product_id, product_name), Orders(product_id, order_date, unit)",
    approach:
      "Join on product, filter by February 2020, GROUP BY product, HAVING SUM(unit) >= 100.",
    hints: [
      "Date range in WHERE.",
      "Aggregate SUM(unit).",
      "HAVING ≥ 100.",
    ],
    pitfalls: ["Using WHERE on the sum."],
    finalCode: `SELECT p.product_name, SUM(o.unit) AS unit
FROM Products p
JOIN Orders o ON p.product_id = o.product_id
WHERE o.order_date BETWEEN '2020-02-01' AND '2020-02-29'
GROUP BY p.product_id, p.product_name
HAVING SUM(o.unit) >= 100;`,
    rememberThis: "WHERE filters dates; HAVING filters the sum.",
  },
  {
    id: "find-users-with-valid-emails",
    title: "Find Users With Valid E-Mails",
    categoryId: "advanced-string",
    difficulty: "Easy",
    learningObjective: "REGEXP with an anchored pattern.",
    whyItMatters: "Email validation is the regex drill everyone has done.",
    schemaHint: "Users(user_id, name, mail)",
    approach: "REGEXP '^[A-Za-z][A-Za-z0-9_.-]*@leetcode\\\\.com$'.",
    hints: [
      "Must start with a letter.",
      "Only letters, digits, _, ., - allowed in prefix.",
      "Domain is exactly leetcode.com — escape the dot.",
    ],
    pitfalls: ["Forgetting ^ and $ anchors."],
    finalCode: `SELECT *
FROM Users
WHERE mail REGEXP '^[A-Za-z][A-Za-z0-9_.-]*@leetcode\\\\.com$';`,
    rememberThis: "Anchor every regex with ^ and $ unless you want partial match.",
  },
];

export const SQL_CATEGORY_MAP: Record<string, SQLCategory> = Object.fromEntries(
  SQL_CATEGORIES.map((c) => [c.id, c]),
);

export const SQL_PROBLEM_MAP: Record<string, SQLProblem> = Object.fromEntries(
  SQL_PROBLEMS.map((p) => [p.id, p]),
);

export const SQL_PROBLEMS_BY_CATEGORY: Record<string, SQLProblem[]> =
  SQL_PROBLEMS.reduce(
    (acc, p) => {
      (acc[p.categoryId] ||= []).push(p);
      return acc;
    },
    {} as Record<string, SQLProblem[]>,
  );
