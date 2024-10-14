data class Person(var name: String, var age: Int, var city: String)

fun main() {

    val person = Person("Серик", 5, "Алматы")

    person.let {
        println("Имя через let: ${it.name}")
        it.age += 1
        println("Возраст через let после увеличения: ${it.age}")
    }

    person.apply {
        name = "Диас"
        city = "Астана"
    }.also {
        println("Данные через apply: $it")
    }

    val greeting = person.run {
        "Привет, меня зовут $name, мне $age лет, я живу в городе $city."
    }
    println("Приветствие через run: $greeting")

    person.also {
        println("Перед изменением возраста: ${it.age}")
        it.age += 1
    }.also {
        println("После изменения возраста через also: ${it.age}")
    }

    with(person) {
        println("Данные через with:")
        println("Имя: $name, Возраст: $age, Город: $city")
    }
}
