# Past Experience

## Domain Experience

### AI Research and Engineering

Developed and tested engineering adaptations of statistical learning, model evaluation, and interpretable analysis to address data validity, expert judgment, and the reliability of research conclusions. Used expert pilots, business experiments, analytical proofs, and recalculation after evidence corrections to turn research methods into project standards that could be used and revised over time. Partner identities, proprietary model details, and project-level performance metrics are subject to confidentiality obligations.
**References:** Methodological foundations and retrospective research context.
#### Duke University × Top-Tier Foundation Model Company
**Location:** Durham, NC; Palo Alto, CA
**Position:** Researcher
**Dates:** September 2023 – September 2026
##### Project 1: Bayesian Quality Control and Adaptive Review
*Developed methods for assessing output quality, contributor reliability, and business outcomes within limited review resources for a frontier foundation-model company. Co-developed standards across travel, food delivery, consumer goods, and e-commerce advertising projects involving approximately 300 annotators. Method contributions covered review allocation, defect diagnosis, and strategy evaluation.*
- **Turned reliability estimates into an adaptive review policy.** Combined beta-binomial posteriors, credible intervals, and verified sample counts to inform additional review and contributor selection, addressing the uncertainty hidden by short runs of correct judgments. Used initial review status to allocate follow-up checks and retained random expert audits outside targeted cases. The design specified how uncertainty should change review effort, alongside the quality-estimation problem in [CROWDLAB (Goh et al., 2022)](https://arxiv.org/abs/2210.06812) and label-budget allocation in [ActiveLab (Goh and Mueller, 2023)](https://arxiv.org/abs/2301.11856).
- Used actual audits, disagreement analysis, and expert adjudication to check judgments against verified references, then update contributor records, feedback, and subsequent review intensity. Built SQL and Python analyses linking tasks, reviews, time spent, and behavioral events; reconciled platform and Hubstaff records with accepted deliverables so that quality and resource decisions could respond to verified output.
- **Developed requirement-level diagnosis that also informed revisions to evaluation criteria.** Separated intent, location, date, and destination-page consistency, linking requirements to observed behavior, failure categories, reviewer rationales, and recheck results. Investigated location, session, redirect, and page changes to distinguish content, routing, and review issues. Examined both contributor judgments and unclear criteria when disputes recurred, then revised the standards. [Guerdan et al. (2025)](https://arxiv.org/abs/2503.05965) examine how underspecified criteria can admit reasonable disagreement.
- Used defect rechecks and random expert audits to assess corrections, translating broad complaints into specific issues engineering teams could investigate and using the findings to revise instructions and reviewer calibration. Project spot checks recorded improved complete requirement matching under the overall quality workflow, without attributing the observation to any single model or review component.
- **Designed strategy evaluation around the user's decision stage.** Compared recommendation strategies under exploratory browsing and immediate purchase conditions, defining dwell time, detail-page clicks, and payment as separate outcomes with their own observation windows. Conducted A/B tests and fitted logistic models for clicks and payment with strategy-by-decision-stage interactions, so findings could specify the decision context and business outcome to which they applied.
- Converted the experiments and regression analyses into context-specific strategy comparisons and reusable experiment guidelines covering matching prerequisites, strategy variables, outcome definitions, and applicability limits. Reported browsing, clicks, and completed transactions separately, then incorporated findings into subsequent evaluation guidance to avoid treating higher engagement as evidence of higher conversion.
##### Project 2: Financial Preference Data Engineering and Model Evaluation
*Led method design for a financial task module supporting a frontier foundation-model company's post-training and evaluation programs. Investigated how to expand expert-authored cases, capture preferences grounded in financial judgment, and test new specifications before production. Owned scenario requirements, reference answers, expansion rules, preference protocols, and pilot design, producing standards other experts could apply independently.*
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
*Led the design of graduate-level physics, mathematical reasoning, and risk-engineering tasks for a frontier AI research lab. Developed original problems, complete solutions, and failure analyses around three questions: how to construct diagnostically useful hard tasks, how to check an argument, and how to verify claims about optimal solutions and limiting bounds.*
- **Designed difficulty around combinations of principles and dependent assumptions.** Used non-routine combinations of established principles, invariants, feasibility conditions, and interacting assumptions to require quantitative formulation before formula application. Converted variables and premises from risk-engineering research into original problems requiring complete derivations, with explicit formulation requirements for expert review. Related quantitative reasoning research includes [Minerva (Lewkowycz et al., 2022)](https://arxiv.org/abs/2206.14858).
- Completed analytical solutions and explicit conditions for the constructed tasks, checking both whether each question was defensible and whether model arguments were valid. Produced original graduate-level problems and reference materials whose analytical results exposed errors in formulation and argument consistency, giving each task a concrete diagnostic purpose.
- **Extended answer checking to the conditions that make an argument valid.** Specified variable relationships, consequential steps, and their assumptions in reference solutions, requiring conclusions to follow from a supported derivation. Allowed alternative valid approaches and organized failures by formulation, omitted conditions, calculation, and proof gaps. Made process evaluation concrete for original scientific tasks, in relation to [Lightman et al. (2023)](https://arxiv.org/abs/2305.20050) and [ProcessBench (Zheng et al., 2024)](https://arxiv.org/abs/2412.06559).
- Used complete derivations to identify where model arguments lost support, delivering failure analyses with error locations, missing conditions, and supporting explanations for further review and task revision. Distinguished the applicability of a formula from the accuracy of its calculation, a distinction also used in [PhysReason (Zhang et al., 2025)](https://arxiv.org/abs/2502.12054). Assessed argument validity without requiring the same sequence of steps as the reference solution.
- **Established separate proof requirements for feasibility, optimality, and attainability.** Required candidate solutions to satisfy the stated constraints, a separate argument to establish that no better result existed, and a further check of whether the bound could be attained. Assigned constructions, boundary arguments, and asymptotic analysis to these different claims so a feasible solution, an attained optimum, and an approachable limit were evaluated distinctly.
- In an original optimization problem, proved that the minimum completion time was attainable and the supremum of completion time was not, then provided a construction approaching the supremum and analyzed its asymptotic behavior. Incorporated these conclusions about existence and limiting behavior into reference solutions and acceptance criteria, using them to check whether the question demanded an impossible attained optimum.
---
#### Duke University × Leading Global Alternative Asset Manager
**Location:** Durham, NC; Washington, DC
**Position:** Researcher
**Dates:** September 2023 – September 2026
##### Project: AI-Driven Investment Research and Explainable Risk Analysis
*University–industry research collaboration with a leading global alternative asset manager ($300B+ AUM as of June 2026; confidential partner). Used operating, financial, sustainability, questionnaire, and third-party materials to develop company assessments that could be checked against their evidence, with analysis conducted in approved local or private-cloud environments.*
- **Developed a method for tracing company scores and model explanations to qualitative evidence.** Converted assessment criteria into structured scoring and validation rules linking company information, judgment conditions, and supporting material. Connected tree-model predictions and SHAP contributions to original inputs and sector context, making the evidence behind scores and explanations available for review. This addressed differences in rating definitions, a problem examined by [Berg, Kölbel, and Rigobon (2022)](https://academic.oup.com/rof/article/26/6/1315/6590670).
- Applied the method to company prediction and sector comparisons, using trees to examine thresholds and interactions and [SHAP (Lundberg and Lee, 2017)](https://arxiv.org/abs/1705.07874) to explain predictive contributions relative to a baseline. Considered fit, interpretability, and the cost of checking influential inputs when selecting methods, with tabular-learning context from [Grinsztajn et al. (2022)](https://arxiv.org/abs/2207.08815). The project contribution was to make explanations point to company materials and due-diligence questions that warranted checking.
- **Designed and implemented a process for revisiting investment conclusions after evidence corrections.** Linked unsupported claims, conflicting sources, and questionable information found through AI-assisted cross-source checks to affected scoring inputs. Required corrections to be followed by recalculation and review of the analytical conclusions. Relevant research distinguishes citation support from factual truth in [Menick et al. (2022)](https://arxiv.org/abs/2203.11147) and documents errors in combining disclosure evidence in [CHATREPORT (Ni et al., 2023)](https://aclanthology.org/2023.emnlp-demo.3/).
- Resolved contradictory information, corrected inputs, and recalculated company scores and model predictions, then separately checked whether rankings and feature attributions changed. Extended evidence review through to the resulting risk assessment, addressing conclusions that could otherwise remain tied to superseded inputs. Used the recalculated outputs to examine the implications of each correction.
- **Made sample and assumption sensitivity part of the test for a research conclusion.** Combined sensitivity analysis and bootstrap resampling for company scores and sector findings, examining variation under changed assumptions and resampled data. Considered these checks alongside predictive explanations and unresolved evidence questions. [Marx et al. (2023)](https://proceedings.mlr.press/v206/marx23a/marx23a.pdf) examine the related reliability problem of different explanations from similarly predictive models.
- Completed resampling and assumption-sensitivity analyses to assess uncertainty in company scores and sector findings, informing which results required additional evidence. Extended a single fitted result into a research output with stability checks, and used evidence quality to qualify the conditions under which conclusions could be used.

### Data Science

Applied statistical learning, data engineering, and market analysis to counterparty screening, market entry, and green-credit assessment. Connected source records, analytical methods, and review criteria to business recommendations and reusable workflows.
#### Jiritsu Network
**Location:** Los Angeles, California, USA (Remote)
**Position:** Business Development and Business Analytics (Full-time)
**Dates:** August 2024 – October 2025
##### Project: Issuer Screening, Human Preference Ranking, and Technology Partnerships
*Owned business development for prospective issuer and protocol-team partners, identifying opportunities to commercialize Jiritsu's asset verification and privacy-preserving computation through services and technology licensing. Responsibilities covered screening design, analytical experiments, data infrastructure, counterparty evaluation, outreach, and delivery of candidate recommendations to the board.*
- **Owned data-driven business development for new issuers as the sole dedicated contributor, reporting directly to co-founder Asher Gottesman.** Translated management's commercialization priorities into screening criteria, data requirements, and outreach priorities; independently managed experimental design, analysis, counterparty discussions, and delivery of recommendations.
- Organized counterparty reviews with the core team, drawing on Asher Gottesman's commercial judgment and guidance from Gene Itkis (MIT Lincoln Laboratory) and Michael Lustig (former Senior Managing Director at BlackRock and Adjunct Professor of Finance at NYU Stern). Evaluated applied cryptography, financial applications of zero-knowledge proofs, technical fit, liquidity, and risk; conducted follow-up analysis and presented the rationale for candidate selection.
- **Diagnosed gaps between token-market performance and partnership value through issuer-level error analysis.** Reviewed projects with polished presentation but weak underlying businesses, unclear issuer identities, or mismatched verification needs. Revised screening criteria and feature requirements around identifiable counterparties, commercial fit, disclosure quality, and tokenization needs.
- Defined the commercial scope across real-world assets (RWA), stablecoins, DeFi, and infrastructure. Encoded exclusions for meme, gambling, adult-content, and other out-of-scope projects, directing research and outreach toward counterparties whose businesses matched Jiritsu's partnership priorities.
- **Designed a two-stage framework combining negative screening with best-in-class ranking.** Applied liquidity, pricing-validity, data-completeness, identity, and risk checks before comparing eligible candidates on commercial relevance, accessibility, information quality, and market characteristics. Kept eligibility decisions distinct from outreach prioritization.
- Resolved issuer identities across CoinGecko metadata, chain records, official websites, white papers, and disclosures. Reconciled multichain listings, wrapped and bridged assets, and third-party wrappers to remove duplicate partnership opportunities while preserving distinct counterparties.
- Built quantitative features and text annotations covering liquidity, market capitalization, activity, project age, chain affiliation, and business disclosures. Refined fields and feature requirements after identity checks and error reviews, incorporating business models, technical needs, and commercial feasibility into candidate assessment.
- Implemented classification and reason codes for ambiguous identities, inadequate disclosure, business risk, and duplicate opportunities. Recorded qualification, exclusion, and evidence-review rationales so leadership and commercial, technical, and investment reviewers could trace individual decisions to the underlying sources and rules.
- **Built a Python, Prefect, DuckDB, and Parquet pipeline for ingestion, standardization, entity mapping, feature preparation, and querying.** Consolidated market records, chain information, and disclosures into a repeatable data workflow for counterparty analysis, model training, and shortlist updates.
- Implemented scheduled refreshes, retries, persisted outputs, reruns, and historical backfills. Retained processing results and reprocessed historical records when needed, allowing issuer assessments to be updated as candidate information changed.
- **Trained a LightGBM pairwise learning-to-rank model on the core team's comparisons of eligible counterparties.** Combined commercial, disclosure, and market features to rank eligible candidates within a pool of approximately 800 potential partners and establish priorities for review and outreach.
- Applied uncertainty sampling principles to focus reviews on borderline candidates, near ties, and conflicting evidence. Distinguished requests for additional preference judgments from missing-data research and eligibility reassessment. Focused expert discussion on decisions that could change the shortlist and adjusted its scope to arrive at 30 priority counterparties.
- Added new pairwise judgments to the training data, retrained LightGBM, and reranked candidates so updated commercial preferences informed rankings across the candidate pool. Conducted repeated comparison and ranking cycles over approximately two to four weeks, revising recommendations as the team provided feedback.
- Used issuer similarity analysis and Leiden community detection to identify potentially overlooked projects with related technical or business characteristics. Returned newly identified candidates to identity, eligibility, and evidence checks before including them in ranking and commercial review.
- **Led Codex-assisted solution design and Python development in a team without a dedicated product function.** Used meta prompting with Codex and ChatGPT deep research to translate business objectives and constraints into analytical plans and development specifications. Selected methods, debugged workflows, and checked issuer-level outputs and shortlist rationales.
- **Screened 18,000+ CoinGecko token records to identify approximately 800 potential counterparties, prioritize 30 for outreach, and select six proposed pilot counterparties.** Discussed asset-verification needs, service arrangements, and technology licensing with prospective partners. Delivered the candidate list and commercial assessments to the board for further technical and business evaluation.
---
#### Euromonitor International
**Location:** Shanghai, China
**Position:** Consulting Intern
**Dates:** September 2021 – May 2022
##### Project: Global Expansion and China Market Entry for a Premium European Appliance Brand
*Owned the China workstream of a global market-entry engagement covering China, Japan, and the Middle East. Developed the analytical framework, specified data requirements, processed validated market data, and prepared competitive and policy research, market-entry recommendations, and presentations to the global project team. The engagement examined local product, pricing, channel, and marketing choices within a consistent global brand position.*
- **Developed China market-entry recommendations from policy research, consumer demand analysis, and comparisons of competing products.** Evaluated appliance categories, product assortments, and sales channels to inform entry timing, pricing, and positioning decisions within the global engagement.
- Structured the China analysis using a mutually exclusive, collectively exhaustive (MECE) framework covering product and category fit, pricing, channels, marketing, and policy conditions. Identified which elements of the client's premium positioning should remain consistent globally and which product and marketing choices required local adaptation.
- **Defined data requirements across five Chinese e-commerce platforms and seven appliance categories.** Specified product attributes, energy-efficiency labels, prices, promotions, and review data for the data science team, translating strategic questions into inputs for competitor, channel, and consumer analysis.
- Coordinated with data scientists responsible for web scraping and reliable data collection, and with in-country analysts who validated the collected records. Owned downstream processing, comparative analysis, and strategic interpretation of the verified data.
- **Used Python to process approximately 50,000 platform product listings**, standardizing energy-efficiency labels, prices, promotions, product attributes, and review information. Established comparable data definitions across platforms and categories for market-supply and consumer-feedback analysis.
- Retained differences in pricing, promotions, and reviews when the same product appeared on multiple platforms. Treated each platform listing as a separate market observation, distinguishing product attributes from channel-specific sales conditions to inform pricing, channel selection, and marketing recommendations.
- **Mapped competing products in Tableau by category, price band, energy-efficiency rating, and feature set to compare competitive intensity and identify crowded or sparsely served segments.** Combined product information with consumer reviews to assess positioning options for the client's portfolio and evaluate market-entry scenarios.
- Identified comparatively limited supply in product segments combining high energy efficiency with mid- to high-price positioning. Assessed these opportunities within market-entry scenarios for tier-1 and tier-2 cities and incorporated the findings into category and positioning recommendations.
- Assessed the suitability of the client's European product range for China, considering local usage needs, product dimensions, and energy-efficiency requirements. Recommended categories and assortments that accommodated Chinese use cases while maintaining the client's premium positioning.
- Evaluated entry options through the brand's own website, e-commerce platforms, physical retail, and channel partnerships, alongside marketing opportunities on Xiaohongshu and Douyin. Examined how assortment, platform pricing, promotions, and consumer feedback should inform sales-channel and brand-communication choices.
- **Researched energy-efficiency requirements, local subsidies, and policy developments through published materials and expert interviews.** Participated in discussions with think-tank experts and incorporated expectations of future subsidy changes into assumptions about category selection, product introduction, and entry timing.
- Developed entry scenarios by appliance category and city tier, accounting for changes in efficiency requirements, subsidies, certification, and market-access conditions. Distinguished current policy requirements from prospective changes when assessing implications for product and channel choices.
- Documented field mappings, standardization rules, and downstream processing logic in a reusable template, allowing subsequent regional analyses to draw on consistent definitions and processing steps.
- **Represented China in global project meetings and delivered the China market report.** Presented the data and policy rationale for local product, pricing, channel, and marketing recommendations; coordinated green-product definitions and policy assumptions, and discussed channel-execution risks and demand for premium products.
- Received a full-time offer from Euromonitor's consulting team during the internship.
---
#### China Construction Bank
**Location:** Shanghai & Suzhou, China
**Position:** Fintech Intern
**Dates:** March 2021 – May 2021
##### Project: Multivariate Sustainability Analysis and Green Credit Screening
- **Contributed to sustainability screening of approximately 2,000 candidate entities under CCB's internal evaluation framework.** Examined financial, operational, and environmental information across more than 30 internal indicators, considering both overall performance and minimum requirements for individual metrics in subsequent green credit research and review.
- Examined the limitations of manually assigned weights, including subjective choices and scoring rationales that were difficult to review. Applied PCA and supervised learning to study relationships among indicators and historical cases, adding empirical evidence to candidate assessment.
- **Applied principal component analysis (PCA) to reduce dimensionality and examine overlapping information across indicators**, producing compact representations for subsequent candidate comparisons and sustainability analysis.
- Applied supervised learning to historically labeled cases, examining relationships between financial, operational, and sustainability features and positive or negative assessments. Compared feature patterns across cases to help interpret differences among candidates and their screening results.
- Drew on life cycle assessment (LCA) principles to incorporate operational and environmental considerations alongside financial analysis, examining business performance and environmental indicators within the sustainability assessment.
- **Screened an initial shortlist representing approximately the top 30% of candidates against individual-metric and overall-score minimums, retaining approximately 28% of the full pool for further research and review.** Checked ranking and threshold compliance separately, excluding candidates that ranked highly but did not meet the minimum requirements.
- Reviewed selected and unselected cases to understand why the remaining approximately 72% fell outside the priority list. Distinguished candidates below the ranking cutoff from those that failed individual or overall thresholds, documenting exclusion patterns and borderline cases for future comparisons.
- Converted unmet requirements, exclusion reasons, and follow-up questions into a reusable review checklist. Linked case findings to the applicable screening rules so subsequent reviews could examine the reasons behind shortlist decisions.
- **Delivered a methodology note documenting scoring logic, data sources, and edge cases.** Explained model behavior, screening rules, and result interpretation for product managers and risk officers evaluating the method's applicability and potential platform adoption.

### Legal Research and Policy Analysis

Authored four research papers examining how legal institutions allocate authority and responsibility under technological and environmental uncertainty. Combined treaty and statutory analysis, structured case comparison, and risk-risk analysis to develop proposals for authorization, oversight, and continuing responsibility.
#### Selected Research Papers
**Research areas:** Technology Governance, Risk Regulation, and Environmental Law
**Author credit:** Letao Ouyang
**Manuscript dates:** December 2024
##### Project 1: Autonomous Authority in Space: Risk Tradeoffs and the Law of Delegation
*Examined when autonomous action can be authorized in advance and when changing conditions or third-party interests require renewed review.*
- **Distinguished legal authority to undertake an activity from evidence supporting autonomous execution.** Analyzed autonomous spacecraft operations, orbital collision avoidance, debris capture, and SETI.
- **Proposed a task-specific authorization framework.** Defined permitted actions, operating conditions, reassessment triggers, independent scrutiny, and records enabling reconstruction of consequential decisions.

---
##### Project 2: Small States and the Governance of Strategic Space Dependence
*Examined how international cooperation and domestic institutions affect a small state's ability to exercise meaningful control over critical space infrastructure.*
- **Distinguished formal authority and asset ownership from operational control and supervisory capacity.** Conducted a structured comparison of New Zealand's launch regulation, Norway's Arctic satellite partnership, and Luxembourg's LUXEOSys procurement.
- **Proposed an accountable-acceptance standard for strategic dependencies.** The proposed standard would require authorities to identify interruption powers, usable response rights, and funded implementation capacity before commitment.

---
##### Project 3: Who May Choose the Lesser Risk: Solar Geoengineering and the Legal Duties of Comparison and Continuity
*Examined who may authorize climate interventions and how responsibility for continued operation and withdrawal should be allocated.*
- **Distinguished projected climate benefits from legitimate authority to deploy.** Examined solar geoengineering through international environmental law and risk-risk analysis.
- **Proposed comparative justification and continuity duties.** Addressed policy alternatives, affected communities, transition financing, and withdrawal; separated changes in political control from abrupt physical termination.

---
##### Project 4: Mangrove Restoration and the Limits of Compensatory Mitigation: Lessons from Florida for the Greater Bay Area
*Examined when ecological restoration evidence can support project approval, acceptance, and compensation for newly authorized habitat loss.*
- **Compared mangrove protection and compensatory mitigation across Florida and the Greater Bay Area.** Examined legal obligations, approval conditions, and evidence of ecological recovery.
- **Proposed staged authorization and acceptance conditions separating construction completion from ecological performance.** Specified site-specific baselines, funded correction, and continuing responsibility for delayed or failed restoration.

### Finance and Consulting

Applied market research, valuation analysis, and risk screening to real estate acquisition advice, technology commercialization, dental-sector research, and equity research. Prepared investment shortlists, diligence assessments, and strategy reports, and supported business-line restructuring in a corporate digital-transformation project.
#### Jones Lang LaSalle Capital Markets Team
**Location:** Beijing, China
**Position:** Summer Intern
**Dates:** June 2024 – August 2024
##### Project: Real Estate Underwriting and ESG Due Diligence
*Worked on acquisition advisory for a Southeast Asian conglomerate investing in Chinese office properties. Served as the project team's ESG lead and coordinated with JLL's internal ESG team. Helped build the investment list and screen potential acquisitions against client preferences, a preliminary budget range, and comparable valuations. Considered post-acquisition office refurbishment and business or property repositioning.*
- **Screened 22 Chinese cities for a Southeast Asian conglomerate's cross-border office-investment mandate.** Evaluated market liquidity and institutional-grade stock across four investable regions and narrowed the universe to 20 assets in Beijing, Shanghai, Guangzhou, Shenzhen, and Chengdu.
- **Developed a GRESB-informed desktop screen with approximately 40 ESG and operating indicators.** Excluded approximately 40% of candidate assets before full valuation and due diligence based on ESG red flags and disproportionate capital-expenditure requirements.
- Structured diligence across management, performance, and development factors; assessed ownership and special-purpose-vehicle transparency, policy coverage, compliance and safety issues, and the availability of 12 months of continuous operating records.
- Benchmarked energy and carbon intensity, water, waste, green-building certifications, and efficiency upgrades against properties matched by city, submarket, vintage, and building-system type. Used equipment age, chiller efficiency, building-management systems, sub-metering, indoor-air monitoring, and maintenance records as proxies for missing utility data.
- Evaluated energy-upgrade, refurbishment, and extension risks through capital-expenditure and cash-flow analysis; translated the findings into red, amber, and green screening signals and asset-specific diligence priorities.
- **Underwrote shortlisted properties using discounted cash flow, replacement cost, and comparable transactions.** Integrated operating conditions and upgrade requirements into valuation assumptions, cash-flow scenarios, and exit-risk assessments.
- Built 10 dashboards in Excel, Python, and Tableau, combining valuation outputs, market fundamentals, ESG indicators, and scenario exposures across city, asset, and investment-pipeline views.
- **Led bilingual briefings for capital-markets leadership and client managers.** Shaped site-visit sequencing and ESG diligence questions and delivered standardized asset books covering tenant concentration, weighted average lease expiry, vacancy, rents, operating costs, valuation models, and diligence findings.
---
#### Hubble Network
**Location:** Seattle, USA
**Position:** Student Consultant and Business Analytics Analyst, Duke Practicum
**Dates:** August 2023 – January 2024
##### Project: Bluetooth Satellite Commercialization and Market Prioritization
*Assessed initial markets for Hubble's existing technology using company-provided cost data, technical parameters, and comparison materials. Research considered cost and accuracy constraints, as well as low-power applications for periodic location reporting with limited real-time requirements. Interviewed sales professionals as part of the market research.*
- **Led shipping, logistics, and industrial asset-tracking research** in a Duke Practicum engagement following Hubble's $20 million Series A and preceding its first satellite launches. Contributed to the team's assessment of approximately 20 use cases, recommendation of five priority segments, and 100-page market landscape and strategy report.
- **Contributed to reframing the go-to-market brief around vertical-market selection.** Structured research around opportunity scanning, elimination criteria, detailed market assessment, sizing, and prioritization to focus early commercialization resources.
- Elicited business objectives, technical parameters, and commercialization constraints from company stakeholders; converted information gaps into research questions and updated market assessments as product and competitive evidence developed.
- Assessed operational needs, incumbent solutions, technical fit, and adoption constraints in shipping, logistics, and industrial tracking; synthesized sector findings into commercially grounded recommendations for the assigned workstreams.
- Prepared and conducted workstream interviews through Duke Pratt's alumni network. Contributed to a team research program spanning approximately 20 fields, typically two or three alumni per field, and 100+ hours of expert interviews.
- Triangulated Fuqua business databases, official statistics, industry reports, competitive research, and expert interviews. Applied SWOT and PESTLE and contributed market-sizing models, scenario forecasts, and sensitivity analyses to compare priority applications.
- Integrated workstream findings into the team's five recommended directions and final strategy report. **Presented conclusions to management and the board**, detailing market attractiveness, competitive conditions, and commercialization constraints.
---
#### SAIF Partners
**Location:** Shanghai, China
**Position:** Summer Intern
**Dates:** June 2022 – October 2022
##### Project: Dental Sector Investment Research and Governance Screening
*Conducted public-data research for a Greater China dental-investment theme. Worked with the VP and investment team on candidate assessment, governance screening, and diligence preparation.*
- **Consolidated approximately 2,000 funding cases and 200 regulatory items into a standardized dataset of 600+ dental deals and 120–150 actionable regulatory events**, establishing the research base for a Greater China dental-investment theme.
- Owned four public-data workstreams covering funding flows, regulation, industry structure, and competition. Assessed orthodontics across aligner brands, private dental chains, equipment, and digital and SaaS providers to inform subsector prioritization.
- Reconciled inputs from approximately 20 sources, including CVSource, industry reporting, and corporate registries; deduplicated financing rounds and standardized entities, subsector tags, dates, round classifications, and currencies.
- Partnered with the VP and investment team to develop a longlist of 100+ targets and narrow it to more than 10 candidates. Profiled financing history, valuation ranges, and investor bases and assigned pass, watch, or exclude recommendations with regulatory, reputational, shareholder, and supplier-risk flags.
- **Operationalized MSCI Corporate Governance and Corporate Behavior topics into 10 subcategories and 33 diligence checks**, covering control complexity, related-party exposure, disclosure gaps, audit quality, and business ethics.
- Authored pass, conditional, and deny memos that informed diligence depth and valuation discussions; specified evidence requirements and management questions for unresolved governance concerns.
- **Presented governance and risk analyses to partners, prompting two management meetings and additional auditor-tenure checks.** Identified accounting and related-party concerns in two finalists and incorporated them into management questioning and on-site diligence priorities.
---
#### CITIC Securities
**Location:** Beijing, China
**Position:** Equity Research Intern
**Dates:** August 2021 – October 2021
##### Project: Equity Research and Valuation Analysis
*Worked in the Agriculture Research Group, following the team's established process for sector-data analysis and research-report collaboration.*
- **Compiled sector datasets and stress-tested valuation assumptions.** Synthesized market and trading commentary for internal investment-strategy discussions, connecting industry evidence with the research team's assessment of investment cases.
---
#### EY-Parthenon
**Position:** Summer Intern
**Dates:** May 2021 – August 2021
##### Project: Digital Transformation and Business-Line Restructuring
*Supported a digital-transformation engagement for a leading Chinese company that was unlisted and preparing to list. The project aimed to reduce costs and improve efficiency.*
- **Helped the team review and restructure business lines and improve visibility into the business**, supporting cost and efficiency analysis and discussions.

### STEM Academic Competitions and Training

Combined advanced physics and mathematics Olympiad training with peer mentoring and independent instruction. Earned provincial- and national-level competition awards, coached teammates in mechanics and electromagnetism, and taught students preparing for USAPhO and U.S. Physics Team selection.
#### Independent STEM Olympiad Training Practice
**Location:** Durham, USA (Hybrid)
**Position:** IPhO-Level Physics Instructor and Original Problem Designer
**Dates:** August 2019 - January 2026
##### Project: Advanced Physics Olympiad Instruction
*Independently coached selected students online and in person, continuing a personal interest in advanced physics and Olympiad problem solving.*
- **Coached multiple students participating in USAPhO and the U.S. Physics Team selection process**, teaching rigorous derivation, structured written solutions, and problem solving under competition time constraints.
- **Delivered IPhO-level instruction** through online and in-person training camps, covering mechanics, electromagnetism, thermodynamics, optics, modern physics, and advanced mathematical methods.
---
#### The High School Attached to Hunan Normal University
**Location:** Changsha, China
**Position:** Physics and Mathematics Olympiad Trainee and Peer Mentor, School Physics Competition Team
**Dates:** August 2016 - January 2019
##### Project: Advanced Olympiad Training and Peer Mentoring
*Trained and served as a peer mentor in a nationally leading school physics Olympiad program. The program subsequently had 10 students selected for China's 50-member national physics Olympiad training squad in 2020 (20% of the national total): eight listed under the school and two who studied in the program with school registration in Chongqing. This exceeded the total from any province or municipality outside Hunan. The program also included a 2019 IPhO gold medalist.*
- **Served as a peer mentor in the team's mechanics and electromagnetism study groups**, coaching teammates through advanced problems and explaining the derivations behind solution methods.
- **Presented mechanics and electromagnetism findings to the full competition team**, sharing detailed derivations and problem-solving methods developed through individual study and collaborative discussion.
- **Earned provincial- and national-level competition awards across physics and mathematics Olympiads.**
- Completed intensive competition training in mechanics, electromagnetism, thermodynamics, optics, and modern physics, including undergraduate-level study of classical mechanics, electrodynamics, statistical physics, and quantum mechanics.
- Studied mathematical analysis, linear algebra, calculus, ordinary differential equations, and numerical analysis; applied these methods to nonstandard physics problems and extended derivations.
