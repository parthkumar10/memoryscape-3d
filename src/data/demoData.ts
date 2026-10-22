import { KnowledgeMap } from '../types';

export const JAVA_OOP_SAMPLE_NOTES = `CS 108: Object-Oriented Programming in Java
Instructor: Dr. Alan Vance · Department of Computer Science
Lecture Unit 03: Core Principles & Object Architecture

[Page 1, ¶1]
A Class in Java acts as a programmer-defined blueprint or template from which individual instances are created. It encapsulates state, represented through field variables, and behavior, expressed through member methods. The class itself occupies static metadata memory, serving as the schema that defines what properties any subsequent instance will possess.

[Page 1, ¶2]
An Object is a concrete, runtime instance of a class allocated on the JVM heap memory. When a program executes the new operator, memory is reserved for the object's instance fields. While a class is an abstract architectural definition, an object possesses an active state, distinct identity, and observable behavior throughout its lifecycle.

[Page 1, ¶3]
A Constructor is a specialized method invoked exclusively during object instantiation to initialize the state of the newly created instance. In Java, constructors share the exact name of their declaring class, have no explicit return type, and can be overloaded with varying parameter signatures to support flexible initialization routines.

[Page 1, ¶4]
Encapsulation is the fundamental design principle of bundling data and the methods that operate on that data within a single defensive unit while restricting direct access to internal components. In idiomatic Java, encapsulation is implemented by declaring fields as private and mediating state access through public getter and setter methods, ensuring data integrity through strict validation barriers.

[Page 2, ¶1]
Inheritance is the mechanism by which a new subclass adopts the non-private attributes and behaviors of an existing superclass using the extends keyword. Inheritance models an intuitive "is-a" taxonomy, facilitating systematic code reuse and establishing an extensible hierarchical structure wherein specialized classes build atop foundational abstractions.

[Page 2, ¶2]
Polymorphism, literally signifying "many forms", empowers a single reference variable of a superclass type to reference instances of any of its derived subclasses. Under subtype polymorphism, Java resolves method invocations dynamically at runtime based upon the actual object instance stored in heap memory rather than the static type of the reference pointer.

[Page 2, ¶3]
Method Overriding occurs when a subclass provides a customized implementation of an instance method that has already been declared in its parent superclass. To override successfully, the method in the child class must match the exact method name, parameter signature, and return type of the parent method, commonly marked with the @Override annotation to enforce compiler verification.

[Page 2, ¶4]
An Abstract Class is a restricted class declared with the abstract modifier that cannot be directly instantiated with the new keyword. It serves as an incomplete conceptual template designed specifically to be subclassed, allowing architects to supply shared concrete methods alongside abstract method signatures that subclasses are obligated to implement.

[Page 3, ¶1]
An Interface in Java represents a pure behavioral contract specifying what a implementing class must accomplish without dictating how. Declared with the interface keyword, an interface contains method signatures and constant declarations. Java supports multiple interface implementation via the implements keyword, providing total polymorphism without multiple inheritance diamond collisions.

[Page 3, ¶2]
Composition is the architectural design technique of assembling complex behavior by containing references to other objects rather than inheriting from them, embodying a "has-a" relationship. Often celebrated in the aphorism "favor composition over inheritance", composition provides loose coupling, dynamic runtime swapping of internal components, and shields the client from fragile base-class changes.`;

export const JAVA_OOP_DEMO_MAP: KnowledgeMap = {
  id: 'demo-java-oop',
  title: 'Java Object-Oriented Programming (Demo)',
  description: 'Foundational OOP architecture derived from CS 108 lecture notes covering encapsulation, polymorphic dispatch, and inheritance hierarchies.',
  sourceType: 'demo',
  sourceTitle: 'CS 108 Course Notes: Lecture Unit 03',
  rawSourceNotes: JAVA_OOP_SAMPLE_NOTES,
  paragraphs: [
    {
      id: 'p1-1',
      ref: 'Page 1, ¶1',
      text: 'A Class in Java acts as a programmer-defined blueprint or template from which individual instances are created. It encapsulates state, represented through field variables, and behavior, expressed through member methods. The class itself occupies static metadata memory, serving as the schema that defines what properties any subsequent instance will possess.',
    },
    {
      id: 'p1-2',
      ref: 'Page 1, ¶2',
      text: 'An Object is a concrete, runtime instance of a class allocated on the JVM heap memory. When a program executes the new operator, memory is reserved for the object\'s instance fields. While a class is an abstract architectural definition, an object possesses an active state, distinct identity, and observable behavior throughout its lifecycle.',
    },
    {
      id: 'p1-3',
      ref: 'Page 1, ¶3',
      text: 'A Constructor is a specialized method invoked exclusively during object instantiation to initialize the state of the newly created instance. In Java, constructors share the exact name of their declaring class, have no explicit return type, and can be overloaded with varying parameter signatures to support flexible initialization routines.',
    },
    {
      id: 'p1-4',
      ref: 'Page 1, ¶4',
      text: 'Encapsulation is the fundamental design principle of bundling data and the methods that operate on that data within a single defensive unit while restricting direct access to internal components. In idiomatic Java, encapsulation is implemented by declaring fields as private and mediating state access through public getter and setter methods, ensuring data integrity through strict validation barriers.',
    },
    {
      id: 'p2-1',
      ref: 'Page 2, ¶1',
      text: 'Inheritance is the mechanism by which a new subclass adopts the non-private attributes and behaviors of an existing superclass using the extends keyword. Inheritance models an intuitive "is-a" taxonomy, facilitating systematic code reuse and establishing an extensible hierarchical structure wherein specialized classes build atop foundational abstractions.',
    },
    {
      id: 'p2-2',
      ref: 'Page 2, ¶2',
      text: 'Polymorphism, literally signifying "many forms", empowers a single reference variable of a superclass type to reference instances of any of its derived subclasses. Under subtype polymorphism, Java resolves method invocations dynamically at runtime based upon the actual object instance stored in heap memory rather than the static type of the reference pointer.',
    },
    {
      id: 'p2-3',
      ref: 'Page 2, ¶3',
      text: 'Method Overriding occurs when a subclass provides a customized implementation of an instance method that has already been declared in its parent superclass. To override successfully, the method in the child class must match the exact method name, parameter signature, and return type of the parent method, commonly marked with the @Override annotation to enforce compiler verification.',
    },
    {
      id: 'p2-4',
      ref: 'Page 2, ¶4',
      text: 'An Abstract Class is a restricted class declared with the abstract modifier that cannot be directly instantiated with the new keyword. It serves as an incomplete conceptual template designed specifically to be subclassed, allowing architects to supply shared concrete methods alongside abstract method signatures that subclasses are obligated to implement.',
    },
    {
      id: 'p3-1',
      ref: 'Page 3, ¶1',
      text: 'An Interface in Java represents a pure behavioral contract specifying what a implementing class must accomplish without dictating how. Declared with the interface keyword, an interface contains method signatures and constant declarations. Java supports multiple interface implementation via the implements keyword, providing total polymorphism without multiple inheritance diamond collisions.',
    },
    {
      id: 'p3-2',
      ref: 'Page 3, ¶2',
      text: 'Composition is the architectural design technique of assembling complex behavior by containing references to other objects rather than inheriting from them, embodying a "has-a" relationship. Often celebrated in the aphorism "favor composition over inheritance", composition provides loose coupling, dynamic runtime swapping of internal components, and shields the client from fragile base-class changes.',
    },
  ],
  concepts: [
    {
      id: 'class',
      title: 'Class',
      briefExplanation: 'The static blueprint or template that defines the instance variables (state) and member methods (behavior) of an entity.',
      beginnerExample: 'public class BankAccount { private double balance; public void deposit(double amount) { ... } }',
      sourceExcerpt: 'A Class in Java acts as a programmer-defined blueprint or template from which individual instances are created. It encapsulates state, represented through field variables, and behavior, expressed through member methods.',
      sourceReference: 'Page 1, ¶1',
      isVerified: true,
      cluster: 'Foundation',
      position: [0, 0, 0],
      color: '#06b6d4', // cyan-500
    },
    {
      id: 'object',
      title: 'Object',
      briefExplanation: 'A live runtime instance of a class allocated on the heap, possessing a distinct identity and active state.',
      beginnerExample: 'BankAccount myAccount = new BankAccount(); // myAccount holds a reference to a live heap object',
      sourceExcerpt: 'An Object is a concrete, runtime instance of a class allocated on the JVM heap memory. When a program executes the new operator, memory is reserved for the object\'s instance fields.',
      sourceReference: 'Page 1, ¶2',
      isVerified: true,
      cluster: 'Foundation',
      position: [3.8, 0.4, 1.2],
      color: '#06b6d4',
    },
    {
      id: 'constructor',
      title: 'Constructor',
      briefExplanation: 'A specialized method sharing the class name with no return type, executed upon instantiation to initialize fields.',
      beginnerExample: 'public BankAccount(double initialBalance) { this.balance = initialBalance; }',
      sourceExcerpt: 'A Constructor is a specialized method invoked exclusively during object instantiation to initialize the state of the newly created instance. In Java, constructors share the exact name of their declaring class, have no explicit return type, and can be overloaded',
      sourceReference: 'Page 1, ¶3',
      isVerified: true,
      cluster: 'Foundation',
      position: [2.5, -0.4, -2.8],
      color: '#06b6d4',
    },
    {
      id: 'encapsulation',
      title: 'Encapsulation',
      briefExplanation: 'Hiding internal state using private access modifiers and mediating access through public getter and setter methods with verification.',
      beginnerExample: 'private double balance; public double getBalance() { return balance; } public void setBalance(double b) { if(b>=0) balance = b; }',
      sourceExcerpt: 'Encapsulation is the fundamental design principle of bundling data and the methods that operate on that data within a single defensive unit while restricting direct access to internal components.',
      sourceReference: 'Page 1, ¶4',
      isVerified: true,
      cluster: 'Data Defense',
      position: [-3.4, 0.2, -1.8],
      color: '#38bdf8', // sky-400
    },
    {
      id: 'inheritance',
      title: 'Inheritance',
      briefExplanation: 'The mechanism whereby a child subclass acquires non-private members of a parent superclass via the extends keyword, establishing an "is-a" relationship.',
      beginnerExample: 'public class SavingsAccount extends BankAccount { private double interestRate; }',
      sourceExcerpt: 'Inheritance is the mechanism by which a new subclass adopts the non-private attributes and behaviors of an existing superclass using the extends keyword. Inheritance models an intuitive "is-a" taxonomy',
      sourceReference: 'Page 2, ¶1',
      isVerified: true,
      cluster: 'Hierarchy',
      position: [-1.4, 1.2, 3.8],
      color: '#8b5cf6', // violet-500
    },
    {
      id: 'polymorphism',
      title: 'Polymorphism',
      briefExplanation: 'Treating specialized objects through a common superclass or interface reference, resolved dynamically at runtime via dynamic method dispatch.',
      beginnerExample: 'BankAccount account = new SavingsAccount(); account.calculateMonthlyInterest(); // resolves SavingsAccount logic',
      sourceExcerpt: 'Polymorphism, literally signifying "many forms", empowers a single reference variable of a superclass type to reference instances of any of its derived subclasses. Under subtype polymorphism, Java resolves method invocations dynamically at runtime',
      sourceReference: 'Page 2, ¶2',
      isVerified: true,
      cluster: 'Polymorphic Dispatch',
      position: [-3.8, 1.6, 2.8],
      color: '#a855f7', // purple-500
    },
    {
      id: 'method-overriding',
      title: 'Method Overriding',
      briefExplanation: 'Redefining a superclass method in a subclass with the identical signature to provide specialized behavior, verified with @Override.',
      beginnerExample: '@Override public void withdraw(double amt) { checkMinimumBalance(); super.withdraw(amt); }',
      sourceExcerpt: 'Method Overriding occurs when a subclass provides a customized implementation of an instance method that has already been declared in its parent superclass. To override successfully, the method in the child class must match the exact method name',
      sourceReference: 'Page 2, ¶3',
      isVerified: true,
      cluster: 'Polymorphic Dispatch',
      position: [1.8, 1.4, 4.2],
      color: '#a855f7',
    },
    {
      id: 'abstract-class',
      title: 'Abstract Class',
      briefExplanation: 'A non-instantiable class declared with abstract that acts as a partial blueprint containing both concrete implementations and abstract method contracts.',
      beginnerExample: 'public abstract class Account { public void logTransaction() { ... } public abstract void applyFees(); }',
      sourceExcerpt: 'An Abstract Class is a restricted class declared with the abstract modifier that cannot be directly instantiated with the new keyword. It serves as an incomplete conceptual template designed specifically to be subclassed',
      sourceReference: 'Page 2, ¶4',
      isVerified: true,
      cluster: 'Abstraction',
      position: [-4.4, 2.0, 0.2],
      color: '#6366f1', // indigo-500
    },
    {
      id: 'interface',
      title: 'Interface',
      briefExplanation: 'A contract specifying method signatures that implementing classes must satisfy via the implements keyword, allowing multiple interface inheritance.',
      beginnerExample: 'public interface Taxable { double calculateTax(); } public class SavingsAccount extends BankAccount implements Taxable { ... }',
      sourceExcerpt: 'An Interface in Java represents a pure behavioral contract specifying what a implementing class must accomplish without dictating how. Declared with the interface keyword, an interface contains method signatures and constant declarations.',
      sourceReference: 'Page 3, ¶1',
      isVerified: true,
      cluster: 'Abstraction',
      position: [-2.6, 2.4, -4.2],
      color: '#6366f1',
    },
    {
      id: 'composition',
      title: 'Composition',
      briefExplanation: 'Assembling complex behaviors by holding references to other objects ("has-a" relationship) rather than extending them, promoting loose coupling.',
      beginnerExample: 'public class BankAccount { private Ledger ledger = new Ledger(); // has-a Ledger }',
      sourceExcerpt: 'Composition is the architectural design technique of assembling complex behavior by containing references to other objects rather than inheriting from them, embodying a "has-a" relationship. Often celebrated in the aphorism "favor composition over inheritance"',
      sourceReference: 'Page 3, ¶2',
      isVerified: true,
      cluster: 'Architecture',
      position: [4.6, -0.2, -1.6],
      color: '#14b8a6', // teal-500
    },
  ],
  relationships: [
    {
      id: 'rel-1',
      sourceId: 'class',
      targetId: 'object',
      label: 'instantiates',
      explanation: 'A Class serves as the template that the JVM uses to instantiate runtime Objects in heap memory.',
    },
    {
      id: 'rel-2',
      sourceId: 'class',
      targetId: 'constructor',
      label: 'contains',
      explanation: 'A Class defines one or more Constructors to initialize its field state upon creation.',
    },
    {
      id: 'rel-3',
      sourceId: 'class',
      targetId: 'encapsulation',
      label: 'implements',
      explanation: 'Encapsulation is realized inside a Class by declaring private fields with public accessor methods.',
    },
    {
      id: 'rel-4',
      sourceId: 'inheritance',
      targetId: 'class',
      label: 'extends',
      explanation: 'Inheritance enables a subclass to extend a parent Class using the extends keyword.',
    },
    {
      id: 'rel-5',
      sourceId: 'inheritance',
      targetId: 'method-overriding',
      label: 'enables',
      explanation: 'Inheritance allows a subclass to override inherited parent methods with specialized logic.',
    },
    {
      id: 'rel-6',
      sourceId: 'polymorphism',
      targetId: 'inheritance',
      label: 'prerequisite',
      explanation: 'Subtype polymorphism requires an inheritance hierarchy or interface implementation to allow reference substitution.',
    },
    {
      id: 'rel-7',
      sourceId: 'polymorphism',
      targetId: 'method-overriding',
      label: 'dispatches',
      explanation: 'Dynamic method dispatch uses runtime polymorphism to execute the overridden child method.',
    },
    {
      id: 'rel-8',
      sourceId: 'abstract-class',
      targetId: 'inheritance',
      label: 'prerequisite',
      explanation: 'An Abstract Class cannot be instantiated directly and depends on inheritance for concrete implementation.',
    },
    {
      id: 'rel-9',
      sourceId: 'interface',
      targetId: 'polymorphism',
      label: 'implements',
      explanation: 'Classes implementing an Interface can be substituted polymorphically through the interface reference.',
    },
    {
      id: 'rel-10',
      sourceId: 'composition',
      targetId: 'inheritance',
      label: 'alternative',
      explanation: 'Composition models "has-a" relationships as a loosely-coupled alternative to "is-a" inheritance hierarchies.',
    },
    {
      id: 'rel-11',
      sourceId: 'composition',
      targetId: 'class',
      label: 'contains',
      explanation: 'A Class contains instance variables pointing to other object types to reuse functionality.',
    },
  ],
  quiz: [
    {
      id: 'q1',
      question: 'A developer executes `BankAccount acc = new SavingsAccount(); acc.withdraw(50.0);` where `SavingsAccount` overrides `withdraw()`. Which method runs at runtime, and why?',
      options: [
        'BankAccount.withdraw() because the reference variable acc is declared as type BankAccount at compile time.',
        'Both methods execute sequentially through the JVM automatic superchain handler.',
        'SavingsAccount.withdraw() because dynamic method dispatch resolves the invocation based on the actual object in heap memory.',
        'A compile-time error occurs because a superclass reference cannot hold a subclass instance.',
      ],
      correctAnswerIndex: 2, // Option C
      explanation: 'As noted in Page 2, ¶2, Java resolves method invocations dynamically at runtime based upon the actual object instance stored in heap memory rather than the static type of the reference pointer.',
      sourceReference: 'Page 2, ¶2',
      linkedConceptIds: ['inheritance', 'method-overriding', 'polymorphism'],
    },
    {
      id: 'q2',
      question: 'To prevent invalid account states (e.g. negative balances), which implementation best adheres to the encapsulation principle from the lecture notes?',
      options: [
        'Declare `private double balance;` and provide a `public void setBalance(double b)` with validation `if (b >= 0)` to mediate state access.',
        'Declare `public double balance;` so all calling code has fast, direct field mutation without method overhead.',
        'Declare `protected static double balance;` shared across all instances so changes synchronize globally.',
        'Mark the class as abstract and allow external packages to directly mutate fields through inheritance.',
      ],
      correctAnswerIndex: 0, // Option A
      explanation: 'Page 1, ¶4 states that encapsulation in idiomatic Java is implemented by declaring fields as private and mediating state access through public getter and setter methods, ensuring data integrity through strict validation barriers.',
      sourceReference: 'Page 1, ¶4',
      linkedConceptIds: ['encapsulation', 'class'],
    },
    {
      id: 'q3',
      question: 'You need completely unrelated classes (`BankAccount`, `Employee`, `Device`) to all support an `auditLog()` operation without sharing state or class hierarchy. Why is an Interface preferred over an Abstract Class here?',
      options: [
        'Interfaces allow defining private mutable fields that serialize automatically across threads.',
        'An abstract class cannot declare concrete methods, so it cannot provide any shared behavior.',
        'Interfaces require all implementing classes to belong to the exact same package root.',
        'Classes can implement multiple interfaces without being forced into a single-inheritance tree or risking diamond collisions.',
      ],
      correctAnswerIndex: 3, // Option D
      explanation: 'Page 3, ¶1 highlights that Java supports multiple interface implementation via the implements keyword, providing total polymorphism without multiple inheritance diamond collisions.',
      sourceReference: 'Page 3, ¶1',
      linkedConceptIds: ['interface', 'abstract-class'],
    },
    {
      id: 'q4',
      question: 'When modeling a `Car` and an `Engine`, why do the lecture notes emphasize "favor composition over inheritance" (`class Car { private Engine engine; }`)?',
      options: [
        'Inheritance prevents the subclass from calling any methods declared on the superclass.',
        'A car "has-an" engine; containment provides loose coupling and permits swapping engine components at runtime without fragile base-class changes.',
        'Extending Engine runs faster in the JVM because object references bypass heap memory.',
        'Composition automatically converts the engine into an abstract class at compile time.',
      ],
      correctAnswerIndex: 1, // Option B
      explanation: 'Page 3, ¶2 notes that composition provides loose coupling, dynamic runtime swapping of internal components, and shields the client from fragile base-class changes.',
      sourceReference: 'Page 3, ¶2',
      linkedConceptIds: ['composition', 'inheritance'],
    },
    {
      id: 'q5',
      question: 'Given `public class User { public User(String name) { ... } }`, what happens if client code calls `User u = new User();`?',
      options: [
        'The JVM automatically runs an implicit zero-argument constructor and initializes name to null.',
        'The program compiles but throws a NullPointerException at runtime during heap initialization.',
        'A compilation error occurs because defining a custom parameterized constructor suppresses the automatic default no-arg constructor.',
        'The class is automatically converted into an interface by the compiler.',
      ],
      correctAnswerIndex: 2, // Option C
      explanation: 'Page 1, ¶3 states that constructors initialize new instances and can be overloaded; in Java, creating a custom parameterized constructor means no default zero-argument constructor is provided unless explicitly declared.',
      sourceReference: 'Page 1, ¶3',
      linkedConceptIds: ['constructor', 'class', 'object'],
    },
  ],
  createdAt: '2026-10-21T00:00:00.000Z',
  updatedAt: '2026-10-21T00:00:00.000Z',
};

export const JAVA_OOP_FOLLOW_UP_QUESTIONS: Record<string, import('../types/index.ts').FollowUpQuestion> = {
  inheritance: {
    id: 'fu-inheritance',
    conceptId: 'inheritance',
    scenario: 'You are designing an enterprise HR system with an existing `Employee` class that has `name`, `id`, and `calculateBasePay()`. A new requirement asks for a `SalesExecutive` with `commissionRate`.',
    question: 'How should you apply inheritance to model this relationship cleanly in Java?',
    options: [
      'Declare `class SalesExecutive implements Employee` and copy all base pay calculations.',
      'Declare `class SalesExecutive extends Employee` to inherit non-private fields and methods, modeling the "is-a" taxonomy.',
      'Declare `class Employee extends SalesExecutive` so that all employees automatically receive commission rates.',
      'Declare both classes inside an interface without implementing any methods.',
    ],
    correctAnswerIndex: 1, // Option B
    explanation: 'Inheritance models an intuitive "is-a" relationship (a SalesExecutive is an Employee), allowing the subclass to inherit base attributes and behavior using the extends keyword.',
    sourceReference: 'Page 2, ¶1',
  },
  'method-overriding': {
    id: 'fu-method-overriding',
    conceptId: 'method-overriding',
    scenario: 'A `TaxCalculator` superclass defines `public double computeTax(double amount)`. A `SpecialEconomicZoneCalculator` subclass needs to compute tax with a 50% discount.',
    question: 'Which method signature in the subclass correctly overrides the parent method?',
    options: [
      'public double computeTax(double amount, double discountRate)',
      'public static double computeTax(double amount)',
      '@Override public double computeTax(double amount)',
      'private double computeTax(double amount)',
    ],
    correctAnswerIndex: 2, // Option C
    explanation: 'Method overriding requires the child method to match the exact method name, parameter signature, and compatible return type of the parent method, verified by the @Override annotation.',
    sourceReference: 'Page 2, ¶3',
  },
  polymorphism: {
    id: 'fu-polymorphism',
    conceptId: 'polymorphism',
    scenario: 'A graphics engine maintains `List<Shape> shapes = List.of(new Circle(), new Rectangle(), new Triangle());`.',
    question: 'When iterating `for (Shape s : shapes) s.render();`, what enables each specific shape to draw its unique geometry?',
    options: [
      'Subtype polymorphism resolves invocations dynamically at runtime based on the actual object in heap memory.',
      'The Java compiler replaces the loop with multiple static if-else statements based on class names.',
      'All shapes are converted into Abstract Classes before rendering.',
      'Encapsulation prevents the loop from accessing the superclass method.',
    ],
    correctAnswerIndex: 0, // Option A
    explanation: 'Under subtype polymorphism, Java resolves method invocations dynamically at runtime based upon the actual object instance stored in heap memory rather than the static type of the reference pointer.',
    sourceReference: 'Page 2, ¶2',
  },
  encapsulation: {
    id: 'fu-encapsulation',
    conceptId: 'encapsulation',
    scenario: 'A `Thermostat` class tracks `private double targetTemperature;`. You need to ensure the temperature stays between 10.0°C and 35.0°C.',
    question: 'How does encapsulation enforce this invariant?',
    options: [
      'Make targetTemperature public so any caller can inspect it directly.',
      'Declare the class final and remove all methods.',
      'Provide a public setter method `setTargetTemperature(double t)` that validates the range before writing to the private field.',
      'Declare targetTemperature inside an interface as a public static constant.',
    ],
    correctAnswerIndex: 2, // Option C
    explanation: 'Encapsulation restricts direct access to internal fields by declaring them private and mediating state access through public getter and setter methods with strict validation barriers.',
    sourceReference: 'Page 1, ¶4',
  },
  'abstract-class': {
    id: 'fu-abstract-class',
    conceptId: 'abstract-class',
    scenario: 'You want a `Document` class that implements concrete `saveToDisk()` logic, but forces every subclass (`PdfDocument`, `WordDocument`) to define its own `parseRawContent()`.',
    question: 'What is the appropriate Java design?',
    options: [
      'Declare an `abstract class Document` with a concrete `saveToDisk()` and an `abstract void parseRawContent()`.',
      'Declare an `interface Document` with private instance variables.',
      'Declare a `final class Document` and mark the parse method static.',
      'Use constructor overloading to prevent instantiation of subclasses.',
    ],
    correctAnswerIndex: 0, // Option A
    explanation: 'An Abstract Class cannot be instantiated directly with new; it serves as an incomplete template allowing architects to supply shared concrete methods alongside abstract method signatures that subclasses must implement.',
    sourceReference: 'Page 2, ¶4',
  },
  interface: {
    id: 'fu-interface',
    conceptId: 'interface',
    scenario: 'You are writing an image processing pipeline. A class `FilteredImage` must both implement `AsyncRenderable` and `AutoCloseable`.',
    question: 'Why does Java permit this design?',
    options: [
      'Java supports multiple interface implementation using the implements keyword, avoiding multiple inheritance diamond collisions.',
      'Interfaces automatically generate constructors at runtime.',
      'Only abstract classes support multiple inheritance in Java.',
      'Interfaces allow multiple classes to share mutable static memory.',
    ],
    correctAnswerIndex: 0, // Option A
    explanation: 'Java supports multiple interface implementation via the implements keyword, providing total polymorphism without multiple inheritance diamond collisions.',
    sourceReference: 'Page 3, ¶1',
  },
  composition: {
    id: 'fu-composition',
    conceptId: 'composition',
    scenario: 'A `PaymentProcessor` can use `CreditCardGateway` today, but might switch to `CryptoGateway` or `BankTransferGateway` at runtime based on user selection.',
    question: 'Why is composition superior to inheritance for this requirement?',
    options: [
      'Composition couples the processor tightly to a single parent class at compile time.',
      'Inheritance prevents the payment processor from accessing gateway methods.',
      'Composition holds a reference to a gateway object, allowing dynamic swapping of implementations at runtime without base-class fragility.',
      'Composition bypasses all JVM security managers.',
    ],
    correctAnswerIndex: 2, // Option C
    explanation: 'Composition embodies a "has-a" relationship, providing loose coupling, dynamic runtime swapping of internal components, and shielding the client from fragile base-class changes.',
    sourceReference: 'Page 3, ¶2',
  },
  class: {
    id: 'fu-class',
    conceptId: 'class',
    scenario: 'A developer writes `public class Customer { String name; void order() {} }`.',
    question: 'What is the relationship between the class and the objects created from it?',
    options: [
      'The class and object are identical and share the exact same runtime memory block.',
      'The class is the static blueprint/schema; calling new Customer() creates concrete runtime object instances on the heap.',
      'A class cannot define behavior; only interfaces can define methods.',
      'The class exists only while the JVM garbage collector is running.',
    ],
    correctAnswerIndex: 1, // Option B
    explanation: 'A Class in Java acts as a programmer-defined blueprint or template from which individual instances are created, encapsulating state and behavior.',
    sourceReference: 'Page 1, ¶1',
  },
  object: {
    id: 'fu-object',
    conceptId: 'object',
    scenario: 'You execute `Account a1 = new Account(100); Account a2 = new Account(100);`.',
    question: 'What is true regarding `a1` and `a2`?',
    options: [
      'a1 and a2 reference the exact same object in heap memory.',
      'a1 and a2 are two distinct object instances with their own separate memory allocations on the JVM heap.',
      'a1 and a2 cannot hold different values because their constructor arguments are equal.',
      'The JVM merges both variables into a single static class reference.',
    ],
    correctAnswerIndex: 1, // Option B
    explanation: 'An Object is a concrete, runtime instance of a class allocated on the JVM heap memory when executing the new operator, possessing active state, distinct identity, and observable behavior.',
    sourceReference: 'Page 1, ¶2',
  },
  constructor: {
    id: 'fu-constructor',
    conceptId: 'constructor',
    scenario: 'You want a `FlightTicket` class to support initialization either with just passenger name or with name plus seat number.',
    question: 'What language feature allows this flexibility?',
    options: [
      'Constructor overloading with different parameter signatures.',
      'Method overriding with the @Override annotation on a static void method.',
      'Multiple inheritance from abstract classes.',
      'Declaring the constructor inside an interface.',
    ],
    correctAnswerIndex: 0, // Option A
    explanation: 'In Java, constructors share the exact name of their declaring class, have no explicit return type, and can be overloaded with varying parameter signatures to support flexible initialization routines.',
    sourceReference: 'Page 1, ¶3',
  },
};

