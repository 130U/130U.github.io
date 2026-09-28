# Past Experience

## Domain Experience

### AI Research and Engineering

Developed and tested engineering adaptations of statistical learning, model evaluation, and interpretable analysis to address data validity, expert judgment, and the reliability of research conclusions. Used expert pilots, business experiments, analytical proofs, and recalculation after evidence corrections to turn research methods into project standards that could be used and revised over time. Partner identities, proprietary model details, and project-level performance metrics are subject to confidentiality obligations.
References identify methodological foundations or provide retrospective research context.
#### Duke University × Top-Tier Foundation Model Company
**Location:** Durham, NC; Palo Alto, CA
**Position:** Researcher
**Dates:** September 2023 – September 2026
##### Project 1: Bayesian Quality Control and Adaptive Review
Developed methods for assessing output quality, contributor reliability, and business outcomes within limited review resources for a frontier foundation-model company. Co-developed standards across travel, food delivery, consumer goods, and e-commerce advertising projects involving approximately 300 annotators. Method contributions covered review allocation, defect diagnosis, and strategy evaluation.
- **Turned reliability estimates into an adaptive review policy.** Combined beta-binomial posteriors, credible intervals, and verified sample counts to inform additional review and contributor selection, addressing the uncertainty hidden by short runs of correct judgments. Used initial review status to allocate follow-up checks and retained random expert audits outside targeted cases. The design specified how uncertainty should change review effort, alongside the quality-estimation problem in [CROWDLAB (Goh et al., 2022)](https://arxiv.org/abs/2210.06812) and label-budget allocation in [ActiveLab (Goh and Mueller, 2023)](https://arxiv.org/abs/2301.11856).
- Used actual audits, disagreement analysis, and expert adjudication to check judgments against verified references, then update contributor records, feedback, and subsequent review intensity. Built SQL and Python analyses linking tasks, reviews, time spent, and behavioral events; reconciled platform and Hubstaff records with accepted deliverables so that quality and resource decisions could respond to verified output.
- **Developed requirement-level diagnosis that also informed revisions to evaluation criteria.** Separated intent, location, date, and destination-page consistency, linking requirements to observed behavior, failure categories, reviewer rationales, and recheck results. Investigated location, session, redirect, and page changes to distinguish content, routing, and review issues. Examined both contributor judgments and unclear criteria when disputes recurred, then revised the standards. [Guerdan et al. (2025)](https://arxiv.org/abs/2503.05965) examine how underspecified criteria can admit reasonable disagreement.
- Used defect rechecks and random expert audits to assess corrections, translating broad complaints into specific issues engineering teams could investigate and using the findings to revise instructions and reviewer calibration. Project spot checks recorded improved complete requirement matching under the overall quality workflow, without attributing the observation to any single model or review component.
- **Designed strategy evaluation around the user's decision stage.** Compared recommendation strategies under exploratory browsing and immediate purchase conditions, defining dwell time, detail-page clicks, and payment as separate outcomes with their own observation windows. Conducted A/B tests and fitted logistic models for clicks and payment with strategy-by-decision-stage interactions, so findings could specify the decision context and business outcome to which they applied.
- Converted the experiments and regression analyses into context-specific strategy comparisons and reusable experiment guidelines covering matching prerequisites, strategy variables, outcome definitions, and applicability limits. Reported browsing, clicks, and completed transactions separately, then incorporated findings into subsequent evaluation guidance to avoid treating higher engagement as evidence of higher conversion.
##### Project 2: Financial Preference Data Engineering and Model Evaluation
Led method design for a financial task module supporting a frontier foundation-model company's post-training and evaluation programs. Investigated how to expand expert-authored cases, capture preferences grounded in financial judgment, and test new specifications before production. Owned scenario requirements, reference answers, expansion rules, preference protocols, and pilot design, producing standards other experts could apply independently.
- **Designed data expansion around business constraints and reference-answer revalidation.** Established scenario matrices, variable dependencies, and rule applicability from real materials, then expanded inputs under defined ranges, perturbations, and boundary conditions. Required revised reference judgments before generating new model responses and expert preferences. The design made input changes trigger specific downstream checks, addressing the evidence-and-calculation links in [FinQA (Chen et al., 2021)](https://arxiv.org/abs/2109.00122) and financial rule checks in [FinRule-Bench (Malarkkan et al., 2026)](https://arxiv.org/abs/2603.11339).
- Checked expanded business relationships, reference solutions, and complete preference records, using independent trial submissions to examine whether cases could be produced from the specifications. Used the findings to repair cases and revise expansion guidance, establishing a sequence from real evidence through constrained variation to renewed expert review, with validity checks as coverage expanded.
- **Designed a preference protocol that tied judgment strength to substantive financial errors.** Recorded direction, strength, comparative rationale, and error type in five-level pairwise judgments. Defined evidence support, decisive variables, rule applicability, and the basis for conclusions to distinguish material errors from minor shortcomings. The contribution was to turn financial judgment into explicit review conditions, related to preference strength in [HelpSteer2-Preference (Wang et al., 2024)](https://arxiv.org/abs/2410.01257) and fine-grained feedback in [Wu et al. (2023)](https://arxiv.org/abs/2306.01693).
- Used independently submitted comparisons and disputed cases to examine how the protocol was interpreted, add boundary examples, revise guidance, and calibrate rating standards. Linked labels to prompts, inputs, response pairs, and rationales so later reviews could distinguish substantive errors, insufficient evidence, and local differences in presentation, with the findings informing subsequent guidance revisions.
- **Created Batch Zero to test new specifications with established contributors.** Before production, selected contributors with reliable delivery records to independently complete task authoring, inputs, reference solutions, and preference review, focusing attention on ambiguity and differences in interpretation. [MultiHiertt (Zhao et al., 2022)](https://aclanthology.org/2022.acl-long.454/) also uses expert piloting and revision; this project's design incorporated internal delivery history into a repeatable test of the complete data workflow.
- Used gaps in instructions, review disagreements, and case defects found during the pilot to revise examples and criteria before Batch One. Completed the handoff of rules, rework conditions, and escalation procedures while retaining responsibility for task design and data strategy. Batch Zero was subsequently reused for new tasks within the company, extending the method beyond a single delivery.
---
#### Duke University × Top-Tier AI Research Lab
**Location:** Durham, NC; Palo Alto, CA
**Position:** Researcher
**Dates:** September 2023 – September 2026
##### Project: Scientific Reasoning Evaluation and Task Design
Led the design of graduate-level physics, mathematical reasoning, and risk-engineering tasks for a frontier AI research lab. Developed original problems, complete solutions, and failure analyses around three questions: how to construct diagnostically useful hard tasks, how to check an argument, and how to verify claims about optimal solutions and limiting bounds.
- **Designed difficulty around combinations of principles and dependent assumptions.** Used non-routine combinations of established principles, invariants, feasibility conditions, and interacting assumptions to require quantitative formulation before formula application. Converted variables and premises from risk-engineering research into original problems requiring complete derivations, with explicit formulation requirements for expert review. Related quantitative reasoning research includes [Minerva (Lewkowycz et al., 2022)](https://arxiv.org/abs/2206.14858).
- Completed analytical solutions and explicit conditions for the constructed tasks, checking both whether each question was defensible and whether model arguments were valid. Produced original graduate-level problems and reference materials whose analytical results exposed errors in formulation and argument consistency, giving each task a concrete diagnostic purpose.
- **Extended answer checking to the conditions that make an argument valid.** Specified variable relationships, consequential steps, and their assumptions in reference solutions, requiring conclusions to follow from a supported derivation. Allowed alternative valid approaches and organized failures by formulation, omitted conditions, calculation, and proof gaps. Made process evaluation concrete for original scientific tasks, in relation to [Lightman et al. (2023)](https://arxiv.org/abs/2305.20050) and [ProcessBench (Zheng et al., 2024)](https://arxiv.org/abs/2412.06559).
- Used complete derivations to identify where model arguments lost support, delivering failure analyses with error locations, missing conditions, and supporting explanations for further review and task revision. Distinguished the applicability of a formula from the accuracy of its calculation, a distinction also used in [PhysReason (Zhang et al., 2025)](https://arxiv.org/abs/2502.12054). Assessed argument validity without requiring the same sequence of steps as the reference solution.
- **Established separate proof requirements for feasibility, optimality, and attainability.** Required candidate solutions to satisfy the stated constraints, a separate argument to establish that no better result existed, and a further check of whether the bound could be attained. Assigned constructions, boundary arguments, and asymptotic analysis to these different claims so a feasible solution, an attained optimum, and an approachable limit were evaluated distinctly.
- In an original optimization problem, proved that the minimum completion time was attainable and the supremum of completion time was not, then provided a construction approaching the supremum and analyzed its asymptotic behavior. Incorporated these conclusions about existence and limiting behavior into reference solutions and acceptance criteria, using them to check whether the question demanded an impossible attained optimum.
---
#### Duke University × Leading Global Alternative Asset Manager
**Location:** Durham, NC;  Washington, DC
**Position:** Researcher
**Dates:** September 2023 – September 2026
##### Project: AI-Driven Investment Research and Explainable Risk Analysis
University–industry research collaboration with a leading global alternative asset manager ($300B+ AUM as of June 2026; confidential partner). Used operating, financial, sustainability, questionnaire, and third-party materials to develop company assessments that could be checked against their evidence, with analysis conducted in approved local or private-cloud environments.
- **Developed a method for tracing company scores and model explanations to qualitative evidence.** Converted assessment criteria into structured scoring and validation rules linking company information, judgment conditions, and supporting material. Connected tree-model predictions and SHAP contributions to original inputs and sector context, making the evidence behind scores and explanations available for review. This addressed differences in rating definitions, a problem examined by [Berg, Kölbel, and Rigobon (2022)](https://academic.oup.com/rof/article/26/6/1315/6590670).
- Applied the method to company prediction and sector comparisons, using trees to examine thresholds and interactions and [SHAP (Lundberg and Lee, 2017)](https://arxiv.org/abs/1705.07874) to explain predictive contributions relative to a baseline. Considered fit, interpretability, and the cost of checking influential inputs when selecting methods, with tabular-learning context from [Grinsztajn et al. (2022)](https://arxiv.org/abs/2207.08815). The project contribution was to make explanations point to company materials and due-diligence questions that warranted checking.
- **Designed and implemented a process for revisiting investment conclusions after evidence corrections.** Linked unsupported claims, conflicting sources, and questionable information found through AI-assisted cross-source checks to affected scoring inputs. Required corrections to be followed by recalculation and review of the analytical conclusions. Relevant research distinguishes citation support from factual truth in [Menick et al. (2022)](https://arxiv.org/abs/2203.11147) and documents errors in combining disclosure evidence in [CHATREPORT (Ni et al., 2023)](https://aclanthology.org/2023.emnlp-demo.3/).
- Resolved contradictory information, corrected inputs, and recalculated company scores and model predictions, then separately checked whether rankings and feature attributions changed. Extended evidence review through to the resulting risk assessment, addressing conclusions that could otherwise remain tied to superseded inputs. Used the recalculated outputs to examine the implications of each correction.
- **Made sample and assumption sensitivity part of the test for a research conclusion.** Combined sensitivity analysis and bootstrap resampling for company scores and sector findings, examining variation under changed assumptions and resampled data. Considered these checks alongside predictive explanations and unresolved evidence questions. [Marx et al. (2023)](https://proceedings.mlr.press/v206/marx23a/marx23a.pdf) examine the related reliability problem of different explanations from similarly predictive models.
- Completed resampling and assumption-sensitivity analyses to assess uncertainty in company scores and sector findings, informing which results required additional evidence. Extended a single fitted result into a research output with stability checks, and used evidence quality to qualify the conditions under which conclusions could be used.

### Data Science

#### Jiritsu Network

**Position:** Business Development Analyst and Business Analyst
**Location:** Los Angeles, USA
**Dates:** August 2024 – October 2025

##### Issuer Screening Infrastructure and Human Preference Ranking

- Reported directly to co-founder Asher Gottesman and received guidance on applied cryptography from Gene Itkis (MIT Lincoln Laboratory) and on financial applications of zero-knowledge proofs from Michael Lustig (former BlackRock Managing Director and NYU Stern Adjunct Professor of Finance). Assessed potential B2B partnerships with token projects and protocol teams, evaluating their business models and potential applications of Jiritsu's cryptographic verification and privacy-preserving computation. Translated these assessments into a screening and prioritization system, narrowing 18,000+ CoinGecko token records to approximately 800 candidate projects and 30 priority counterparties for leadership review and business-development follow-up; also supported verification preparation for 6 tokenization pilots.

- Diagnosed misalignment between token-market quality and partnership value through issuer-level error analysis; revised screening criteria and feature requirements around identifiable counterparties, commercial fit, disclosure quality, and tokenization needs.

- Designed a two-stage decision framework combining negative screening and best-in-class ranking; enforced liquidity, pricing-validity, data-completeness, identity, and risk exclusions before ranking eligible issuers on business relevance, accessibility, information quality, and market characteristics.

- Defined the commercial universe across real-world assets, stablecoins, DeFi, and infrastructure; encoded exclusions for meme, gambling, NSFW, and other out-of-scope businesses, aligning the candidate pool with the company's partnership mandate.

- Performed issuer entity resolution across CoinGecko metadata, chain records, official websites, white papers, and disclosures; reconciled multichain listings, wrapped and bridged assets, and third-party wrappers to remove duplicate opportunities while preserving distinct counterparties.

- Implemented classification and reason-code logic for identity ambiguity, inadequate disclosure, business risk, and duplication; preserved qualification, exclusion, and evidence-review rationales for CEO, business-development, risk, and governance review.

- Engineered a repeatable Python, Prefect, DuckDB, and Parquet pipeline spanning ingestion, standardization, entity mapping, feature preparation, querying, and scheduled refreshes; implemented retries, persisted outputs, reruns, and backfills to support updated issuer analysis.

- Trained a LightGBM pairwise learning-to-rank model on human preferences between eligible issuers; combined business, disclosure, and market features to extend comparative judgments across the approximately 800-issuer universe.

- Applied uncertainty-driven review to close rankings, conflicting evidence, and decisions near the Top-30 cutoff; separated preference-labeling requests from missing-data research and eligibility reassessment, concentrating expert attention on consequential decisions.

- Incorporated new human preferences into training data, retrained LightGBM, and reranked the candidate universe; established a feedback loop that propagated updated business judgments beyond individual manual shortlist edits.

- Used issuer similarity analysis and Leiden community detection to surface overlooked counterparties; returned newly identified candidates to identity, eligibility, and evidence checks before ranking and commercial review.

- Directed Codex-assisted solution design and Python development in a team without a dedicated product function; translated CEO requirements into specifications, selected analytical methods, debugged workflows, and validated issuer-level outputs and shortlist rationales.

#### Euromonitor International

**Position:** In-Country Analyst
**Location:** Shanghai, China
**Dates:** September 2021 – May 2022

##### China Market Entry and Appliance Market Intelligence

- Owned the China workstream of a global market-entry engagement for a European appliance brand; integrated policy, consumer demand, and competitive-supply analysis into launch-timing, pricing, and positioning recommendations.

- Engineered an automated Python ETL pipeline covering 50,000 SKUs across 5 e-commerce platforms and 7 appliance categories; standardized energy-efficiency labels, prices, promotions, product features, and review signals into a comparable market dataset.

- Mapped national programs, local subsidy pilots, and energy-efficiency standard transitions; developed category- and city-tier scenarios incorporating regulatory stability, tightening requirements, subsidy volatility, certification, and approval constraints.

- Built Tableau views of competitive intensity and shelf density; identified underserved combinations of high efficiency and mid- to high-price positioning, particularly in tier-1 and tier-2 cities, and integrated the findings into market-entry scenarios.

- Converted ETL logic into a reusable APAC template, doubling processing throughput and reducing repeated manual cleaning across regional analyses.

- Represented China in global stakeholder discussions, harmonizing green-product definitions, assessing policy-rollout assumptions, and communicating channel-execution risks and consumer trade-up patterns.

#### China Construction Bank Asia

**Position:** Fintech Intern
**Location:** Suzhou, China
**Dates:** March 2021 – May 2021

##### Multivariate Sustainability Screening

- Applied principal component analysis to 10 sustainability indicators across 2,000 issuers; constructed a ranked screening universe and identified the top 28% for prioritized credit and equity research.

- Delivered a methodology note documenting scoring logic, source data, and edge cases; translated model behavior into reviewable specifications for product managers and risk officers assessing platform adoption.

### Environmental, Social, and Governance

#### Duke Law School

**Position:** Research Assistant
**Location:** Durham, USA
**Dates:** August 2024 – December 2024

##### Comparative Environmental Governance and Restoration Evaluation

- Conducted comparative regulatory analysis of Clean Water Act Section 404, the Endangered Species Act, and Florida mangrove protections against Greater Bay Area coastal-governance approaches, organizing the findings around environmental protection and restoration requirements.

- Evaluated West Lake restoration as a nature-based solution; mapped monitoring, reporting, and verification metrics and environmental co-benefits, and analyzed blue-carbon pathways within the broader coastal-governance research.

#### Nicholas School of the Environment

**Position:** Research Assistant
**Location:** Durham, USA
**Dates:** January 2024 – May 2024

##### Shareholder Stewardship and Governance Risk Analysis

- Analyzed proxy statements and 10-K filings to assess executive pay–performance alignment, board-oversight weaknesses, and governance risks relevant to shareholder stewardship.

- Produced a committee-style voting memo recommending opposition to say-on-pay, withholding support for the chair, and support for priority ESG proposals; linked each recommendation to documented evidence and a specific governance-risk rationale.

#### Nicholas School of the Environment

**Position:** Research Assistant
**Location:** Durham, USA
**Dates:** January 2024 – May 2024

##### Life Cycle Assessment and Sustainability Optimization

- Conducted a life cycle assessment using ecoinvent, identified 5 principal environmental-impact drivers, and developed targeted optimization strategies that improved the client's sustainability score by 66%.

### Finance and Consulting

#### Jones Lang LaSalle Capital Markets Team

**Position:** Summer Intern
**Location:** Beijing, China
**Dates:** June 2024 – August 2024

##### Real Estate Underwriting and ESG Due Diligence

- Screened 22 Chinese cities for a Southeast Asian conglomerate's cross-border office-investment mandate; evaluated market liquidity and institutional-grade stock across four investable regions and narrowed the universe to 20 assets in Beijing, Shanghai, Guangzhou, Shenzhen, and Chengdu.

- Developed a GRESB-informed desktop screen with approximately 40 ESG and operating indicators; excluded approximately 40% of candidate assets before full valuation and due diligence based on ESG red flags and disproportionate capital-expenditure requirements.

- Structured diligence across management, performance, and development factors; assessed ownership and special-purpose-vehicle transparency, policy coverage, compliance and safety issues, and the availability of 12 months of continuous operating records.

- Benchmarked energy and carbon intensity, water, waste, green-building certifications, and efficiency upgrades against properties matched by city, submarket, vintage, and building-system type; used equipment age, chiller efficiency, building-management systems, sub-metering, indoor-air monitoring, and maintenance records as proxies for missing utility data.

- Evaluated energy-upgrade, refurbishment, and extension risks through capital-expenditure and cash-flow analysis; translated the findings into red, amber, and green screening signals and asset-specific diligence priorities.

- Underwrote shortlisted properties using discounted cash flow, replacement cost, and comparable transactions; integrated operating conditions and upgrade requirements into valuation assumptions, cash-flow scenarios, and exit-risk assessments.

- Built 10 dashboards in Excel, Python, and Tableau, combining valuation outputs, market fundamentals, ESG indicators, and scenario exposures across city, asset, and investment-pipeline views.

- Led bilingual briefings for capital-markets leadership and client managers; shaped site-visit sequencing and ESG diligence questions and delivered standardized asset books covering tenant concentration, weighted average lease expiry, vacancy, rents, operating costs, valuation models, and diligence findings.

#### Hubble Network

**Position:** Student Consultant and Business Analytics Analyst, Duke Practicum
**Location:** Seattle, USA
**Dates:** August 2023 – January 2024

##### Bluetooth Satellite Commercialization and Market Prioritization

- Led shipping, logistics, and industrial asset-tracking research in a Duke Practicum engagement following Hubble's $20 million Series A and preceding its first satellite launches; contributed to the team's assessment of approximately 20 use cases, recommendation of 5 priority segments, and 100-page market landscape and strategy report.

- Contributed to reframing the go-to-market brief around vertical-market selection; structured research around opportunity scanning, elimination criteria, detailed market assessment, sizing, and prioritization to focus early commercialization resources.

- Elicited business objectives, technical parameters, and commercialization constraints from company stakeholders; converted information gaps into research questions and updated market assessments as product and competitive evidence developed.

- Assessed operational needs, incumbent solutions, technical fit, and adoption constraints in shipping, logistics, and industrial tracking; synthesized sector findings into commercially grounded recommendations for the assigned workstreams.

- Prepared and conducted workstream interviews through Duke Pratt's alumni network; contributed to a team research program spanning approximately 20 fields, typically two or three alumni per field, and 100+ hours of expert interviews.

- Triangulated Fuqua business databases, official statistics, industry reports, competitive research, and expert interviews; applied SWOT and PESTLE and contributed market-sizing models, scenario forecasts, and sensitivity analyses to compare priority applications.

- Integrated workstream findings into the team's five recommended directions and final strategy report; presented conclusions to management and the board, detailing market attractiveness, competitive conditions, and commercialization constraints.

#### SAIF Partners

**Position:** Summer Intern
**Location:** Shanghai, China
**Dates:** June 2022 – October 2022

##### Dental Sector Investment Research and Governance Screening

- Consolidated approximately 2,000 funding cases and 200 regulatory items into a standardized dataset of 600+ dental deals and 120–150 actionable regulatory events, establishing the research base for a Greater China dental-investment theme.

- Owned four public-data workstreams covering funding flows, regulation, industry structure, and competition; assessed orthodontics across aligner brands, private dental chains, equipment, and digital and SaaS providers to inform subsector prioritization.

- Reconciled inputs from approximately 20 sources, including CVSource, industry reporting, and corporate registries; deduplicated financing rounds and standardized entities, subsector tags, dates, round classifications, and currencies.

- Partnered with the VP and investment team to develop a 100+ target longlist and narrow it to more than 10 candidates; profiled financing history, valuation ranges, and investor bases and assigned pass, watch, or exclude recommendations with regulatory, reputational, shareholder, and supplier-risk flags.

- Operationalized MSCI Corporate Governance and Corporate Behavior topics into 10 subcategories and 33 diligence checks, covering control complexity, related-party exposure, disclosure gaps, audit quality, and business ethics.

- Authored pass, conditional, and deny memos that informed diligence depth and valuation discussions; specified evidence requirements and management questions for unresolved governance concerns.

- Presented governance and risk analyses to partners, prompting 2 management meetings and additional auditor-tenure checks; identified accounting and related-party concerns in 2 finalists and incorporated them into management questioning and on-site diligence priorities.

#### CITIC Securities

**Position:** Equity Research Intern
**Location:** Beijing, China
**Dates:** July 2021 – September 2021

##### Equity Research and Valuation Analysis

- Compiled sector datasets, stress-tested valuation assumptions, and synthesized market and trading commentary for internal investment-strategy discussions, connecting industry evidence with the research team's assessment of investment cases.

### STEM Academic Competitions and Training

#### Independent STEM Olympiad Training Practice

**Position:** IPhO-Level Physics Instructor and Original Problem Designer
**Location:** Durham, USA, Hybrid
**Dates:** August 2019 – January 2026

##### Advanced Physics Olympiad Instruction

- Delivered sustained IPhO-level instruction through online and in-person training camps, covering mechanics, electromagnetism, thermodynamics, optics, modern physics, and advanced mathematical methods.

- Coached multiple students for the United States Physics Olympiad pathway; taught rigorous derivation, structured solution development, and disciplined reasoning under competition time constraints.

#### The High School Attached to Hunan Normal University

**Position:** Physics and Mathematics Olympiad Trainee, School Physics Competition Team
**Location:** Changsha, China
**Dates:** August 2016 – January 2019

##### Advanced Physics Training and Peer Research

- Trained in the school's formal physics Olympiad program within a cohort that produced a 2019 IPhO gold medalist; the program subsequently led Chinese high schools in 2020 with 8 national physics Olympiad training-team selections.

- Completed intensive competition training in mechanics, electromagnetism, thermodynamics, optics, and modern physics, including undergraduate-level study of classical mechanics, electrodynamics, statistical physics, and quantum mechanics.

- Developed advanced mathematical foundations through mathematical analysis, linear algebra, calculus, ordinary differential equations, and numerical analysis; applied these methods to nonstandard physics problems and extended derivations.

- Conducted in-depth study in the team's mechanics and electromagnetism groups and presented findings to the full competition team, translating independent technical investigation into shared problem-solving methods.
